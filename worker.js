export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    try {
      let response;
      if (method === 'GET') {
        if (path === '/api/jugadores') response = await env.DB.prepare('SELECT * FROM jugadores ORDER BY numero ASC').all();
        else if (path === '/api/noticias') response = await env.DB.prepare('SELECT * FROM noticias ORDER BY fecha DESC, creado_at DESC').all();
        else if (path === '/api/partidos') response = await env.DB.prepare('SELECT * FROM partidos ORDER BY fecha ASC').all();
        else if (path === '/api/tabla') {
          const r = await env.DB.prepare('SELECT * FROM tabla_posiciones ORDER BY (jg*3+je) DESC, (gf-gc) DESC, gf DESC').all();
          response = { results: r.results.map(t => ({ ...t, jj: t.jg+t.je+t.jp, dg: t.gf-t.gc, pts: t.jg*3+t.je })) };
        }
        else if (path === '/api/galeria') response = await env.DB.prepare('SELECT * FROM galeria ORDER BY orden ASC').all();
        else if (path === '/api/productos') response = await env.DB.prepare('SELECT * FROM productos ORDER BY orden ASC').all();
        else if (path === '/api/auth/check') {
          const token = (request.headers.get('Authorization')||'').replace('Bearer ','');
          if (!token) return json({authenticated:false}, corsHeaders);
          const s = await env.DB.prepare('SELECT s.*, u.nombre, u.email, u.rol FROM sesiones s JOIN usuarios u ON s.usuario_id=u.id WHERE s.token=? AND s.expira>datetime("now")').bind(token).first();
          return json(s ? {authenticated:true, user:{id:s.usuario_id,nombre:s.nombre,email:s.email,rol:s.rol}} : {authenticated:false}, corsHeaders);
        }
        else { response = await serveStatic(url); }
      } else if (method === 'POST') {
        if (path === '/api/auth/login') {
          const {email, password} = await request.json();
          const u = await env.DB.prepare('SELECT * FROM usuarios WHERE email=?').bind(email).first();
          if (!u) return json({error:'Correo o contraseña incorrectos'}, 401, corsHeaders);
          const ok = await verifyPassword(password, u.password);
          if (!ok) return json({error:'Correo o contraseña incorrectos'}, 401, corsHeaders);
          const token = 'tk_'+Date.now().toString(36)+'_'+Math.random().toString(36).substr(2,8);
          await env.DB.prepare('INSERT INTO sesiones (token, usuario_id, expira) VALUES (?,?,?)').bind(token, u.id, new Date(Date.now()+7*86400000).toISOString()).run();
          return json({token, user:{id:u.id,nombre:u.nombre,email:u.email,rol:u.rol}}, 200, corsHeaders);
        } else if (path === '/api/auth/register') {
          const {nombre, email, password} = await request.json();
          if (!nombre||!email||!password) return json({error:'Faltan campos'}, 400, corsHeaders);
          const ex = await env.DB.prepare('SELECT id FROM usuarios WHERE email=?').bind(email).first();
          if (ex) return json({error:'Correo ya registrado'}, 409, corsHeaders);
          const id = 'u_'+Date.now().toString(36);
          const hashed = await hashPassword(password);
          await env.DB.prepare('INSERT INTO usuarios (id,nombre,email,password,rol) VALUES (?,?,?,?,?)').bind(id, nombre, email, hashed, 'user').run();
          const token = 'tk_'+Date.now().toString(36)+'_r'+Math.random().toString(36).substr(2,6);
          await env.DB.prepare('INSERT INTO sesiones (token, usuario_id, expira) VALUES (?,?,?)').bind(token, id, new Date(Date.now()+7*86400000).toISOString()).run();
          return json({token, user:{id, nombre, email, rol:'user'}}, 201, corsHeaders);
        } else if (path === '/api/auth/logout') {
          const token = (request.headers.get('Authorization')||'').replace('Bearer ','');
          if (token) await env.DB.prepare('DELETE FROM sesiones WHERE token=?').bind(token).run();
          return json({message:'Sesión cerrada'}, 200, corsHeaders);
        } else if (path === '/api/contacto') {
          const {nombre, email, asunto, mensaje} = await request.json();
          if (!nombre||!email||!mensaje) return json({error:'Faltan campos'}, 400, corsHeaders);
          return json({message:'Mensaje enviado correctamente'}, 200, corsHeaders);
        } else if (path === '/api/carrito/comprar') {
          const {items, nombre, email, direccion} = await request.json();
          if (!items||!items.length||!nombre||!email||!direccion) return json({error:'Faltan datos de envío'}, 400, corsHeaders);
          return json({message:'Pedido realizado con éxito', ordenId:'ORD-'+Date.now().toString(36).toUpperCase()}, 200, corsHeaders);
        } else {
          const auth = await verifyAdmin(request, env);
          if (!auth) return json({error:'No autorizado'}, 401, corsHeaders);
          const body = await request.json();
          let id, tabla, campos, valores;
          if (path === '/api/admin/noticias') { tabla='noticias'; campos='id,titulo,categoria,fecha,resumen,imagen'; valores=[id='n_'+Date.now().toString(36), body.titulo, body.categoria, body.fecha, body.resumen, body.imagen||'']; }
          else if (path === '/api/admin/partidos') { tabla='partidos'; campos='id,rival,fecha,lugar,competencia,goles_local,goles_visita,resultado'; valores=[id='p_'+Date.now().toString(36), body.rival, body.fecha, body.lugar||'', body.competencia||'', '[]', '[]', null]; }
          else if (path === '/api/admin/jugadores') { tabla='jugadores'; campos='id,nombre,posicion,numero,detalle,foto'; valores=[id='j_'+Date.now().toString(36), body.nombre, body.posicion, body.numero, body.detalle||'', body.foto||'']; }
          else if (path === '/api/admin/tabla') { tabla='tabla_posiciones'; campos='id,nombre,inicial,jg,je,jp,gf,gc'; valores=[id='t_'+Date.now().toString(36), body.nombre, body.inicial, body.jg||0, body.je||0, body.jp||0, body.gf||0, body.gc||0]; }
          else if (path === '/api/admin/productos') { tabla='productos'; campos='id,nombre,precio,descripcion,imagen,categoria,orden'; valores=[id='pr_'+Date.now().toString(36), body.nombre, body.precio, body.descripcion||'', body.imagen||'', body.categoria||'', body.orden||0]; }
          else return json({error:'Ruta no encontrada'}, 404, corsHeaders);
          await env.DB.prepare('INSERT INTO '+tabla+' ('+campos+') VALUES ('+valores.map(()=>'?').join(',')+')').bind(...valores).run();
          return json({message:'Creado', id}, 201, corsHeaders);
        }
      } else if (method === 'DELETE') {
        const auth = await verifyAdmin(request, env);
        if (!auth) return json({error:'No autorizado'}, 401, corsHeaders);
        const id = path.split('/').pop();
        let tabla;
        if (path.includes('/noticias/')) tabla='noticias';
        else if (path.includes('/partidos/')) tabla='partidos';
        else if (path.includes('/jugadores/')) tabla='jugadores';
        else if (path.includes('/tabla/')) tabla='tabla_posiciones';
        else if (path.includes('/productos/')) tabla='productos';
        else return json({error:'Ruta no encontrada'}, 404, corsHeaders);
        await env.DB.prepare('DELETE FROM '+tabla+' WHERE id=?').bind(id).run();
        return json({message:'Eliminado'}, 200, corsHeaders);
      }
      if (response && response.headers) {
        const h = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k,v]) => h.set(k,v));
        return new Response(response.body, {status:response.status, headers:h});
      }
      return response;
    } catch(err) { return json({error:err.message}, 500, corsHeaders); }
  }
};

function json(d,s=200,h={}){ return new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json',...h}}); }

async function verifyAdmin(r,e){
  const t=(r.headers.get('Authorization')||'').replace('Bearer ','');
  if(!t)return false;
  const s=await e.DB.prepare('SELECT s.*,u.rol FROM sesiones s JOIN usuarios u ON s.usuario_id=u.id WHERE s.token=? AND s.expira>datetime("now") AND u.rol=?').bind(t,'admin').first();
  return !!s;
}

async function serveStatic(u){ const p=u.pathname==='/'?'/index.html':u.pathname; try{const r=await fetch(new Request(p));if(r.status===200)return r;}catch(e){} return json({error:'No encontrado'},404); }

// ── Hashing de contraseñas (PBKDF2 + salt, con Web Crypto nativo de Workers) ──

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  return bufToHex(salt) + ':' + bufToHex(new Uint8Array(key));
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false; // password antigua sin hash
  const [saltHex, hashHex] = stored.split(':');
  const salt = hexToBuf(saltHex);
  const key = await deriveKey(password, salt);
  const computedHex = bufToHex(new Uint8Array(key));
  return computedHex === hashHex;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']);
  return await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations:100000, hash:'SHA-256'}, keyMaterial, 256);
}

function bufToHex(buf) { return Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join(''); }
function hexToBuf(hex) { const b=new Uint8Array(hex.length/2); for(let i=0;i<b.length;i++) b[i]=parseInt(hex.substr(i*2,2),16); return b; }