-- ══════════════════════════════════════════
-- HUGUS FC — Schema completo D1
-- ══════════════════════════════════════════

-- Usuarios registrados
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  creado_en TEXT DEFAULT (datetime('now'))
);

-- Roles de administrador (vinculados a usuarios)
CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  permisos TEXT DEFAULT 'total',
  asignado_en TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Noticias del club
CREATE TABLE IF NOT EXISTS noticias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  categoria TEXT,
  fecha TEXT,
  resumen TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);

-- Partidos
CREATE TABLE IF NOT EXISTS partidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rival TEXT NOT NULL,
  fecha TEXT,
  lugar TEXT,
  competencia TEXT,
  resultado TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);

-- Jugadores (plantilla)
CREATE TABLE IF NOT EXISTS jugadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  posicion TEXT,
  numero INTEGER,
  detalle TEXT,
  foto TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);

-- Tabla de posiciones (equipos)
CREATE TABLE IF NOT EXISTS tabla (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  inicial TEXT,
  jj INTEGER DEFAULT 0,
  jg INTEGER DEFAULT 0,
  je INTEGER DEFAULT 0,
  jp INTEGER DEFAULT 0,
  gf INTEGER DEFAULT 0,
  gc INTEGER DEFAULT 0,
  dg INTEGER DEFAULT 0,
  pts INTEGER DEFAULT 0
);