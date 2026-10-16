const EDITABLE_FIELDS = [
  "a1", "a2", "c1doc", "c2doc",
  "v1Decision", "v1Cause", "v1Other",
  "v3Status", "v3Cause", "v3Other",
  "education", "general", "specific", "notes"
];
const EDITABLE_SET = new Set(EDITABLE_FIELDS);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0"
    }
  });
}

async function ensureTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY,
      num INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      c1 TEXT DEFAULT '',
      a1 TEXT DEFAULT '',
      a2 TEXT DEFAULT '',
      c1doc TEXT DEFAULT '',
      c2doc TEXT DEFAULT '',
      v1Decision TEXT DEFAULT '',
      v1Cause TEXT DEFAULT '',
      v1Other TEXT DEFAULT '',
      v3Status TEXT DEFAULT '',
      v3Cause TEXT DEFAULT '',
      v3Other TEXT DEFAULT '',
      education TEXT DEFAULT '',
      general TEXT DEFAULT '',
      specific TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      updated_at TEXT DEFAULT ''
    )
  `).run();

  // Safe migration: add only missing columns and never delete existing evaluation data.
  const result = await db.prepare("PRAGMA table_info(records)").all();
  const existing = new Set((result.results || []).map(column => column.name));
  const required = {
    num: "INTEGER NOT NULL DEFAULT 0",
    name: "TEXT NOT NULL DEFAULT ''",
    role: "TEXT NOT NULL DEFAULT ''",
    c1: "TEXT DEFAULT ''",
    a1: "TEXT DEFAULT ''",
    a2: "TEXT DEFAULT ''",
    c1doc: "TEXT DEFAULT ''",
    c2doc: "TEXT DEFAULT ''",
    v1Decision: "TEXT DEFAULT ''",
    v1Cause: "TEXT DEFAULT ''",
    v1Other: "TEXT DEFAULT ''",
    v3Status: "TEXT DEFAULT ''",
    v3Cause: "TEXT DEFAULT ''",
    v3Other: "TEXT DEFAULT ''",
    education: "TEXT DEFAULT ''",
    general: "TEXT DEFAULT ''",
    specific: "TEXT DEFAULT ''",
    notes: "TEXT DEFAULT ''",
    updated_at: "TEXT DEFAULT ''"
  };
  for (const [column, definition] of Object.entries(required)) {
    if (!existing.has(column)) {
      await db.prepare(`ALTER TABLE records ADD COLUMN ${column} ${definition}`).run();
    }
  }
}

function normalizeSeedRecord(record) {
  const normalized = {
    id: Number(record.id),
    num: Number(record.num || 0),
    name: String(record.name || ""),
    role: String(record.role || "")
  };
  for (const field of EDITABLE_FIELDS) normalized[field] = String(record[field] ?? "");
  return normalized;
}

async function insertMissingSeedRows(db, seed) {
  const statements = [];
  for (const raw of seed) {
    const row = normalizeSeedRecord(raw);
    if (!Number.isInteger(row.id) || row.id < 1 || !row.name || !row.role) continue;
    statements.push(db.prepare(`
      INSERT INTO records (
        id, num, name, role, a1, a2, c1doc, c2doc,
        v1Decision, v1Cause, v1Other, v3Status, v3Cause, v3Other,
        education, general, specific, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO NOTHING
    `).bind(
      row.id, row.num, row.name, row.role,
      row.a1, row.a2, row.c1doc, row.c2doc,
      row.v1Decision, row.v1Cause, row.v1Other,
      row.v3Status, row.v3Cause, row.v3Other,
      row.education, row.general, row.specific, row.notes
    ));
  }
  for (let i = 0; i < statements.length; i += 40) {
    await db.batch(statements.slice(i, i + 40));
  }
}

async function syncRecords(db, rows) {
  const statements = [];
  for (const raw of rows) {
    const id = Number(raw.id);
    if (!Number.isInteger(id) || id < 1) continue;
    const values = EDITABLE_FIELDS.map(field => String(raw[field] ?? ""));
    statements.push(db.prepare(`
      UPDATE records SET
        a1 = ?, a2 = ?, c1doc = ?, c2doc = ?,
        v1Decision = ?, v1Cause = ?, v1Other = ?,
        v3Status = ?, v3Cause = ?, v3Other = ?,
        education = ?, general = ?, specific = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(...values, id));
  }
  for (let i = 0; i < statements.length; i += 40) {
    await db.batch(statements.slice(i, i + 40));
  }
  return statements.length;
}

export async function onRequest(context) {
  const db = context.env.DB;
  if (!db) {
    return json({ error: "No está conectado el binding D1 llamado DB en Cloudflare Pages." }, 500);
  }

  try {
    await ensureTable(db);
    const request = context.request;
    const method = request.method.toUpperCase();

    if (method === "GET") {
      const result = await db.prepare("SELECT * FROM records ORDER BY id").all();
      return json({ records: result.results || [] });
    }

    if (method === "PATCH") {
      const body = await request.json();
      const id = Number(body.id);
      const key = String(body.key || "");
      const value = String(body.value ?? "");
      if (!Number.isInteger(id) || id < 1 || !EDITABLE_SET.has(key)) {
        return json({ error: "Registro o campo inválido." }, 400);
      }
      if (value.length > 10000) return json({ error: "El valor supera el tamaño permitido." }, 413);
      const result = await db.prepare(
        `UPDATE records SET ${key} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).bind(value, id).run();
      if (result.meta && result.meta.changes === 0) {
        const exists = await db.prepare("SELECT id FROM records WHERE id = ?").bind(id).first();
        if (!exists) return json({ error: "No existe el postulante indicado." }, 404);
      }
      return json({ ok: true });
    }

    if (method === "POST") {
      const body = await request.json();

      // Used for undo/redo, backup import and intentional reset. Static names/roles are never changed.
      if (body.action === "sync") {
        if (!Array.isArray(body.records)) return json({ error: "Falta la lista de registros." }, 400);
        const updated = await syncRecords(db, body.records);
        return json({ ok: true, updated });
      }

      // Seed only inserts missing IDs. Existing records are never overwritten or deleted by initialization.
      const seed = Array.isArray(body.seed) ? body.seed : [];
      if (!seed.length) return json({ error: "No se recibieron registros iniciales." }, 400);
      await insertMissingSeedRows(db, seed);
      const count = await db.prepare("SELECT COUNT(*) AS total FROM records").first();
      return json({ ok: true, initialized: true, total: Number(count?.total || 0) });
    }

    return json({ error: "Método no permitido." }, 405);
  } catch (error) {
    return json({ error: "Error interno al procesar la base de datos.", detail: String(error?.message || error) }, 500);
  }
}
