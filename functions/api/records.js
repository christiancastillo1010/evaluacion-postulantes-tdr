const ALLOWED = new Set(["a1","a2","c1","education","general","specific","notes"]);

async function ensureTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY,
      num INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      a1 TEXT DEFAULT '',
      a2 TEXT DEFAULT '',
      c1 TEXT DEFAULT '',
      education TEXT DEFAULT '',
      general TEXT DEFAULT '',
      specific TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8", "cache-control":"no-store"}
  });
}

export async function onRequest(context) {
  const db = context.env.DB;
  if (!db) return json({error:"D1 no está conectado. En Cloudflare agrega un binding llamado DB."},500);
  await ensureTable(db);
  const method=context.request.method;

  if(method==="GET"){
    const {results}=await db.prepare("SELECT * FROM records ORDER BY id").all();
    return json({records:results});
  }

  if(method==="PATCH"){
    const body=await context.request.json();
    const id=Number(body.id), key=String(body.key||""), value=String(body.value??"");
    if(!Number.isInteger(id)||!ALLOWED.has(key)) return json({error:"Solicitud inválida."},400);
    const sql=`UPDATE records SET ${key} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.prepare(sql).bind(value,id).run();
    return json({ok:true});
  }

  if(method==="POST"){
    const body=await context.request.json();
    const seed=Array.isArray(body.seed)?body.seed:[];
    if(!seed.length) return json({error:"No se recibieron registros."},400);
    if(body.replace) await db.prepare("DELETE FROM records").run();

    // Upsert in batches so the initial 215 records are saved safely.
    for(let i=0;i<seed.length;i+=40){
      const batch=seed.slice(i,i+40).map(r=>db.prepare(`
        INSERT INTO records (id,num,name,role,a1,a2,c1,education,general,specific,notes,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          num=excluded.num,name=excluded.name,role=excluded.role,
          a1=excluded.a1,a2=excluded.a2,c1=excluded.c1,
          education=excluded.education,general=excluded.general,
          specific=excluded.specific,notes=excluded.notes,
          updated_at=CURRENT_TIMESTAMP
      `).bind(
        Number(r.id),Number(r.num),String(r.name||""),String(r.role||""),
        String(r.a1||""),String(r.a2||""),String(r.c1||""),
        String(r.education||""),String(r.general||""),String(r.specific||""),String(r.notes||"")
      ));
      await db.batch(batch);
    }
    return json({ok:true});
  }

  return json({error:"Método no permitido."},405);
}
