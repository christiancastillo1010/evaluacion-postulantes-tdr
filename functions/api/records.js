const EDITABLE_FIELDS = [
  "name", "a1", "a2", "c1doc", "c2doc",
  "v1Decision", "v1Cause", "v1Other",
  "v3Status", "v3Cause", "v3Other",
  "education", "general", "specific", "notes"
];
const EDITABLE_SET = new Set(EDITABLE_FIELDS);
const MODULE_KEYS = new Set(["principal", "evaluador1", "evaluador2", "evaluador3", "evaluador4", "evaluador5", "evaluador6"]);
const DEFAULT_MODULE_NAMES = {principal:'Módulo principal',evaluador1:'Evaluador 1',evaluador2:'Evaluador 2',evaluador3:'Evaluador 3',evaluador4:'Evaluador 4',evaluador5:'Evaluador 5',evaluador6:'Evaluador 6'};
function normalizeName(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase();}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store, max-age=0" }
  });
}

async function ensureTable(db) {
  // Tabla histórica del módulo principal: se conserva sin cambiar sus claves.
  await db.prepare(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY, num INTEGER NOT NULL DEFAULT 0, name TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '',
    c1 TEXT DEFAULT '', a1 TEXT DEFAULT '', a2 TEXT DEFAULT '', c1doc TEXT DEFAULT '', c2doc TEXT DEFAULT '',
    v1Decision TEXT DEFAULT '', v1Cause TEXT DEFAULT '', v1Other TEXT DEFAULT '', v3Status TEXT DEFAULT '',
    v3Cause TEXT DEFAULT '', v3Other TEXT DEFAULT '', education TEXT DEFAULT '', general TEXT DEFAULT '',
    specific TEXT DEFAULT '', notes TEXT DEFAULT '', updated_at TEXT DEFAULT '',
    universe TEXT DEFAULT 'principal', universeName TEXT DEFAULT 'Universo principal', itemNo INTEGER DEFAULT 0, itemLabel TEXT DEFAULT '', deleted INTEGER NOT NULL DEFAULT 0
  )`).run();
  const result = await db.prepare("PRAGMA table_info(records)").all();
  const existing = new Set((result.results || []).map(column => column.name));
  const required = {
    num:"INTEGER NOT NULL DEFAULT 0", name:"TEXT NOT NULL DEFAULT ''", role:"TEXT NOT NULL DEFAULT ''", c1:"TEXT DEFAULT ''",
    a1:"TEXT DEFAULT ''", a2:"TEXT DEFAULT ''", c1doc:"TEXT DEFAULT ''", c2doc:"TEXT DEFAULT ''", v1Decision:"TEXT DEFAULT ''",
    v1Cause:"TEXT DEFAULT ''", v1Other:"TEXT DEFAULT ''", v3Status:"TEXT DEFAULT ''", v3Cause:"TEXT DEFAULT ''", v3Other:"TEXT DEFAULT ''",
    education:"TEXT DEFAULT ''", general:"TEXT DEFAULT ''", specific:"TEXT DEFAULT ''", notes:"TEXT DEFAULT ''", updated_at:"TEXT DEFAULT ''",
    universe:"TEXT DEFAULT 'principal'", universeName:"TEXT DEFAULT 'Universo principal'", itemNo:"INTEGER DEFAULT 0", itemLabel:"TEXT DEFAULT ''", deleted:"INTEGER NOT NULL DEFAULT 0"
  };
  for (const [column, definition] of Object.entries(required)) {
    if (!existing.has(column)) await db.prepare(`ALTER TABLE records ADD COLUMN ${column} ${definition}`).run();
  }
  await db.prepare("UPDATE records SET universe='principal' WHERE universe IS NULL OR universe='' ").run();
  await db.prepare("UPDATE records SET universeName='Universo principal' WHERE universe='principal' AND (universeName IS NULL OR universeName='')").run();

  // Una sola base D1 para los seis evaluadores. La clave compuesta aísla los ID repetidos entre módulos.
  await db.prepare(`CREATE TABLE IF NOT EXISTS module_records (
    module_key TEXT NOT NULL, id INTEGER NOT NULL, num INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '', c1 TEXT DEFAULT '',
    a1 TEXT DEFAULT '', a2 TEXT DEFAULT '', c1doc TEXT DEFAULT '', c2doc TEXT DEFAULT '',
    v1Decision TEXT DEFAULT '', v1Cause TEXT DEFAULT '', v1Other TEXT DEFAULT '', v3Status TEXT DEFAULT '',
    v3Cause TEXT DEFAULT '', v3Other TEXT DEFAULT '', education TEXT DEFAULT '', general TEXT DEFAULT '',
    specific TEXT DEFAULT '', notes TEXT DEFAULT '', updated_at TEXT DEFAULT '',
    universe TEXT DEFAULT '', universeName TEXT DEFAULT '', itemNo INTEGER DEFAULT 0, itemLabel TEXT DEFAULT '', deleted INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (module_key, id)
  )`).run();
  const moduleInfo = await db.prepare("PRAGMA table_info(module_records)").all();
  const moduleColumns = new Set((moduleInfo.results || []).map(column => column.name));
  if (!moduleColumns.has('deleted')) await db.prepare("ALTER TABLE module_records ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_module_records_universe ON module_records(module_key, universe, itemNo, num)").run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS shared_other_causes (cause_type TEXT NOT NULL, description TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (cause_type, description))`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS module_settings (module_key TEXT PRIMARY KEY, display_name TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  for (const [key, displayName] of Object.entries(DEFAULT_MODULE_NAMES)) {
    await db.prepare("INSERT OR IGNORE INTO module_settings (module_key,display_name) VALUES (?,?)").bind(key,displayName).run();
  }
}

async function readSharedMetadata(db){
  const settings=await db.prepare("SELECT module_key,display_name FROM module_settings").all();
  const moduleNames={...DEFAULT_MODULE_NAMES};
  for(const row of (settings.results||[]))if(MODULE_KEYS.has(row.module_key)&&String(row.display_name||'').trim())moduleNames[row.module_key]=String(row.display_name);
  const principal=await db.prepare("SELECT name, universe FROM records WHERE deleted=0 AND TRIM(COALESCE(name,''))<>''").all();
  const others=await db.prepare("SELECT module_key,name,universe FROM module_records WHERE deleted=0 AND TRIM(COALESCE(name,''))<>''").all();
  const counts=new Map();
  const add=(moduleKey,universe,name)=>{const normalized=normalizeName(name);if(!normalized)return;const key=normalized;counts.set(key,{count:(counts.get(key)?.count||0)+1,name:String(name).trim(),normalized});};
  for(const row of (principal.results||[]))add('principal',row.universe,row.name);
  for(const row of (others.results||[]))add(String(row.module_key||''),row.universe,row.name);
  const duplicateNames=new Set();
  for(const value of counts.values())if(value.count>1)duplicateNames.add(value.normalized);
  const otherCauses=await db.prepare("SELECT cause_type AS type, description FROM shared_other_causes ORDER BY created_at, description").all();
  return {moduleNames,duplicateNames:[...duplicateNames],sharedOtherCauses:otherCauses.results||[]};
}

function normalizeSeedRecord(record) {
  const normalized = {
    id:Number(record.id), num:Number(record.num || 0), name:String(record.name || ''), role:String(record.role || ''),
    universe:String(record.universe || 'principal'), universeName:String(record.universeName || (record.universe === 'principal' || !record.universe ? 'Universo principal' : record.universe)),
    itemNo:Number(record.itemNo || 0), itemLabel:String(record.itemLabel || record.role || '')
  };
  for (const field of EDITABLE_FIELDS) normalized[field] = String(record[field] ?? '');
  return normalized;
}

async function insertMissingSeedRows(db, seed, moduleKey) {
  const statements = [];
  for (const raw of seed) {
    const row = normalizeSeedRecord(raw);
    if (!Number.isInteger(row.id) || row.id < 1 || !row.name || !row.role) continue;
    if (moduleKey === 'principal') {
      statements.push(db.prepare(`INSERT INTO records (
        id,num,name,role,a1,a2,c1doc,c2doc,v1Decision,v1Cause,v1Other,v3Status,v3Cause,v3Other,education,general,specific,notes,
        universe,universeName,itemNo,itemLabel,deleted,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET num=excluded.num,name=excluded.name,role=excluded.role,a1=excluded.a1,a2=excluded.a2,c1doc=excluded.c1doc,c2doc=excluded.c2doc,v1Decision=excluded.v1Decision,v1Cause=excluded.v1Cause,v1Other=excluded.v1Other,v3Status=excluded.v3Status,v3Cause=excluded.v3Cause,v3Other=excluded.v3Other,education=excluded.education,general=excluded.general,specific=excluded.specific,notes=excluded.notes,universe=excluded.universe,universeName=excluded.universeName,itemNo=excluded.itemNo,itemLabel=excluded.itemLabel,deleted=0,updated_at=CURRENT_TIMESTAMP`).bind(
        row.id,row.num,row.name,row.role,row.a1,row.a2,row.c1doc,row.c2doc,row.v1Decision,row.v1Cause,row.v1Other,row.v3Status,row.v3Cause,row.v3Other,
        row.education,row.general,row.specific,row.notes,row.universe,row.universeName,row.itemNo,row.itemLabel,0
      ));
    } else {
      statements.push(db.prepare(`INSERT INTO module_records (
        module_key,id,num,name,role,a1,a2,c1doc,c2doc,v1Decision,v1Cause,v1Other,v3Status,v3Cause,v3Other,education,general,specific,notes,
        universe,universeName,itemNo,itemLabel,deleted,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(module_key,id) DO UPDATE SET num=excluded.num,name=excluded.name,role=excluded.role,a1=excluded.a1,a2=excluded.a2,c1doc=excluded.c1doc,c2doc=excluded.c2doc,v1Decision=excluded.v1Decision,v1Cause=excluded.v1Cause,v1Other=excluded.v1Other,v3Status=excluded.v3Status,v3Cause=excluded.v3Cause,v3Other=excluded.v3Other,education=excluded.education,general=excluded.general,specific=excluded.specific,notes=excluded.notes,universe=excluded.universe,universeName=excluded.universeName,itemNo=excluded.itemNo,itemLabel=excluded.itemLabel,deleted=0,updated_at=CURRENT_TIMESTAMP`).bind(
        moduleKey,row.id,row.num,row.name,row.role,row.a1,row.a2,row.c1doc,row.c2doc,row.v1Decision,row.v1Cause,row.v1Other,row.v3Status,row.v3Cause,row.v3Other,
        row.education,row.general,row.specific,row.notes,row.universe,row.universeName,row.itemNo,row.itemLabel,0
      ));
    }
  }
  for (let i=0;i<statements.length;i+=40) await db.batch(statements.slice(i,i+40));
}

async function syncRecords(db, rows, moduleKey) {
  const statements=[];
  const fields=EDITABLE_FIELDS;
  const assignments=fields.map(field=>`${field}=?`).join(',');
  for (const raw of rows) {
    const id=Number(raw.id); if (!Number.isInteger(id)||id<1) continue;
    const values=fields.map(field=>String(raw[field]??''));
    if (moduleKey === 'principal') {
      statements.push(db.prepare(`UPDATE records SET ${assignments},updated_at=CURRENT_TIMESTAMP WHERE id=? AND deleted=0`).bind(...values,id));
    } else {
      statements.push(db.prepare(`UPDATE module_records SET ${assignments},updated_at=CURRENT_TIMESTAMP WHERE module_key=? AND id=? AND deleted=0`).bind(...values,moduleKey,id));
    }
  }
  for(let i=0;i<statements.length;i+=40) await db.batch(statements.slice(i,i+40));
  return statements.length;
}

export async function onRequest(context) {
  const request=context.request;
  const url=new URL(request.url);
  const moduleKey=String(url.searchParams.get('module')||'principal');
  if(!MODULE_KEYS.has(moduleKey)) return json({error:'Módulo de trabajo no válido.'},400);
  const db=context.env.DB;
  if(!db) return json({error:'Falta configurar el binding D1 DB. Todos los módulos utilizan esta misma base de datos.'},500);
  try {
    await ensureTable(db);
    const method=request.method.toUpperCase();
    const isMain=moduleKey==='principal';
    if(method==='GET' && url.searchParams.get('action')==='meta') {
      return json(await readSharedMetadata(db));
    }
    if(method==='GET') {
      const result=isMain
        ? await db.prepare("SELECT * FROM records ORDER BY universe, itemNo, num, id").all()
        : await db.prepare("SELECT id,num,name,role,c1,a1,a2,c1doc,c2doc,v1Decision,v1Cause,v1Other,v3Status,v3Cause,v3Other,education,general,specific,notes,updated_at,universe,universeName,itemNo,itemLabel,deleted FROM module_records WHERE module_key=? ORDER BY universe, itemNo, num, id").bind(moduleKey).all();
      return json({module:moduleKey,records:result.results||[]});
    }
    if(method==='DELETE') {
      const id=Number(url.searchParams.get('id'));
      const universe=String(url.searchParams.get('universe')||'');
      if(!Number.isInteger(id)||id<1||!universe)return json({error:'ID o universo inválido.'},400);
      const result=isMain
        ? await db.prepare("UPDATE records SET deleted=1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND universe=? AND deleted=0").bind(id,universe).run()
        : await db.prepare("UPDATE module_records SET deleted=1,updated_at=CURRENT_TIMESTAMP WHERE module_key=? AND id=? AND universe=? AND deleted=0").bind(moduleKey,id,universe).run();
      if(result.meta&&result.meta.changes===0)return json({error:'No se encontró la persona activa en este universo.'},404);
      return json({ok:true,deleted:true,module:moduleKey,id});
    }
    if(method==='PATCH') {
      const body=await request.json(), id=Number(body.id), key=String(body.key||''), value=String(body.value??'');
      if(!Number.isInteger(id)||id<1||!EDITABLE_SET.has(key)) return json({error:'Registro o campo inválido.'},400);
      if(value.length>10000) return json({error:'El valor supera el tamaño permitido.'},413);
      if(key==='name'&&!value.trim()) return json({error:'El nombre del postulante no puede quedar vacío.'},400);
      const result=isMain
        ? await db.prepare(`UPDATE records SET ${key}=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(value,id).run()
        : await db.prepare(`UPDATE module_records SET ${key}=?,updated_at=CURRENT_TIMESTAMP WHERE module_key=? AND id=? AND deleted=0`).bind(value,moduleKey,id).run();
      if(result.meta&&result.meta.changes===0){
        const exists=isMain
          ? await db.prepare('SELECT id FROM records WHERE id=?').bind(id).first()
          : await db.prepare('SELECT id FROM module_records WHERE module_key=? AND id=?').bind(moduleKey,id).first();
        if(!exists)return json({error:'No existe el postulante indicado en este módulo.'},404);
      }
      return json({ok:true,module:moduleKey});
    }
    if(method==='POST') {
      const body=await request.json();
      if(body.action==='addOtherCause') {
        const type=String(body.type||'');
        const description=String(body.description||'').trim().replace(/\s+/g,' ');
        if(!['v1','v3'].includes(type)||description.length<3||description.length>500)return json({error:'Tipo o descripción de causal inválidos.'},400);
        const existing=await db.prepare("SELECT description FROM shared_other_causes WHERE cause_type=? AND lower(description)=lower(?) LIMIT 1").bind(type,description).first();
        if(!existing)await db.prepare("INSERT OR IGNORE INTO shared_other_causes (cause_type,description) VALUES (?,?)").bind(type,description).run();
        return json({ok:true,shared:true,type,description});
      }
      if(body.action==='patchMany') {
        if(!Array.isArray(body.changes)||body.changes.length>1000)return json({error:'Lista de cambios inválida o demasiado grande.'},400);
        const statements=[];
        for(const change of body.changes){
          const id=Number(change.id),key=String(change.key||''),value=String(change.value??'');
          if(!Number.isInteger(id)||id<1||!EDITABLE_SET.has(key)||value.length>10000||(key==='name'&&!value.trim()))continue;
          statements.push(isMain
            ? db.prepare(`UPDATE records SET ${key}=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND deleted=0`).bind(value,id)
            : db.prepare(`UPDATE module_records SET ${key}=?,updated_at=CURRENT_TIMESTAMP WHERE module_key=? AND id=? AND deleted=0`).bind(value,moduleKey,id));
        }
        for(let i=0;i<statements.length;i+=40)await db.batch(statements.slice(i,i+40));
        return json({ok:true,module:moduleKey,updated:statements.length});
      }
      if(body.action==='renameModule') {
        const displayName=String(body.displayName||'').trim();
        if(displayName.length<2||displayName.length>80)return json({error:'El nombre del módulo debe tener entre 2 y 80 caracteres.'},400);
        await db.prepare(`INSERT INTO module_settings (module_key,display_name,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(module_key) DO UPDATE SET display_name=excluded.display_name,updated_at=CURRENT_TIMESTAMP`).bind(moduleKey,displayName).run();
        return json({ok:true,module:moduleKey,displayName});
      }
      if(body.action==='sync') {
        if(!Array.isArray(body.records)) return json({error:'Falta la lista de registros.'},400);
        return json({ok:true,module:moduleKey,updated:await syncRecords(db,body.records,moduleKey)});
      }
      const seed=Array.isArray(body.seed)?body.seed:[];
      if(!seed.length) return json({error:'No se recibieron registros iniciales.'},400);
      await insertMissingSeedRows(db,seed,moduleKey);
      const count=isMain
        ? await db.prepare('SELECT COUNT(*) AS total FROM records').first()
        : await db.prepare('SELECT COUNT(*) AS total FROM module_records WHERE module_key=?').bind(moduleKey).first();
      return json({ok:true,module:moduleKey,initialized:true,total:Number(count?.total||0)});
    }
    return json({error:'Método no permitido.'},405);
  } catch(error) { return json({error:'Error interno al procesar la base de datos.',detail:String(error?.message||error)},500); }
}
