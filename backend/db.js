const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.db");

db.serialize(() => {
  // Seed default tables
  db.run(
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)`,
  );
  db.run(
    `CREATE TABLE
      IF NOT EXISTS apps
      (
        id TEXT,
        user_id INTEGER,
        name TEXT,
        version TEXT,
        entry_point TEXT,
        icon_path TEXT,
        allow_resize INTEGER,
        allow_maximize INTEGER,
        default_width INTEGER,
        default_height INTEGER,
        min_width INTEGER,
        min_height INTEGER,
        max_width INTEGER,
        max_height INTEGER,
        default_x INTEGER,
        default_y INTEGER,
        borderless INTEGER,
        permissions TEXT,
        name_locale TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        PRIMARY KEY(user_id, id)
      )`,
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS filetypes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, app_id TEXT, filetype TEXT, "default" BOOLEAN, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(app_id) REFERENCES apps(id), UNIQUE(user_id, app_id, filetype))`,
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, setting TEXT NOT NULL, value TEXT, FOREIGN KEY(user_id) REFERENCES users(id), UNIQUE(user_id, setting))`,
  );
});

// --- SEED DATA DEFINITIONS ---

const DEFAULT_FILETYPES = [
  ["sys.next.videoplayer", "mp4"],
  ["sys.next.videoplayer", "mov"],
  ["sys.next.audioplayer", "mp3"],
  ["sys.next.audioplayer", "wav"],
  ["sys.next.audioplayer", "ogg"],
  ["sys.next.audioplayer", "flac"],
  ["sys.next.audioplayer", "m4a"],
  ["sys.next.imageviewer", "png"],
  ["sys.next.imageviewer", "jpg"],
  ["sys.next.imageviewer", "jpeg"],
  ["sys.next.imageviewer", "gif"],
  ["sys.next.imageviewer", "webp"],
  ["sys.next.imageviewer", "svg"],
  ["sys.next.imageviewer", "bmp"],
];

const DEFAULT_SETTINGS = [
  ["taskbarStyle", "floating"],
  ["taskbarAlignment", "center"],
  ["language", "en"],
  ["showDeveloperOptions", "false"],
  ["showSeconds", "false"],
  ["twentyFourHourClock", "false"],
  ["timezone", "system"],
  ["colorScheme", "system"],
  ["wallpaper", "builtin:wallpaper-light-color.webp"],
  ["showReloadButton", "false"],
  ["showInspectButton", "false"],
];

const DEFAULT_APPS = [
  {
    id: "sys.next.notes",
    name: "Notes",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    name_locale:
      '{"en":"Notes", "pt":"Notas", "zh":"笔记", "es":"Notas", "fr":"Notes","de":"Notizen"}',
  },
  {
    id: "sys.next.calculator",
    name: "Calculator",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    allow_resize: 0,
    allow_maximize: 0,
    default_width: 300,
    default_height: 420,
    min_width: 300,
    min_height: 420,
    max_width: 300,
    max_height: 420,
    name_locale:
      '{"en":"Calculator","pt":"Calculadora","zh":"计算器","es":"Calculadora","fr":"Calculatrice","de":"Taschenrechner"}',
  },
  {
    id: "sys.next.calendar",
    name: "Calendar",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    name_locale:
      '{"en":"Calendar","pt":"Calendário","zh":"日历","es":"Calendario","fr":"Calendrier","de":"Kalender"}',
  },
  {
    id: "sys.next.filemanager",
    name: "File Manager",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    permissions: '["windowSpawning", "diskAccess"]',
    name_locale:
      '{"en":"File Manager","pt":"Gestor de Ficheiros","zh":"文件管理器","es":"Administrador de Archivos","fr":"Gestionnaire de Fichiers","de":"Dateimanager"}',
  },
  {
    id: "sys.next.weather",
    name: "Weather",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    name_locale:
      '{"en":"Weather","pt":"Meteorologia","zh":"天气","es":"Clima","fr":"Météo","de":"Wetter"}',
  },
  {
    id: "sys.next.videoplayer",
    name: "Video Player",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    permissions: '["positionManipulation"]',
    name_locale:
      '{"en":"Video Player","pt":"Leitor de Vídeo","zh":"视频播放器","es":"Reproductor de Video","fr":"Lecteur Vidéo","de":"Videoplayer"}',
  },
  {
    id: "sys.next.apitest",
    name: "API Test",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    permissions:
      '["positionManipulation", "windowSpawning", "cameraAccess", "microphoneAccess"]',
  },
  {
    id: "sys.next.audioplayer",
    name: "Audio Player",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    name_locale:
      '{"en":"Audio Player","pt":"Leitor de Áudio","zh":"音频播放器","es":"Reproductor de Audio","fr":"Lecteur Audio","de":"Audioplayer"}',
  },
  {
    id: "sys.next.imageviewer",
    name: "Image Viewer",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    permissions: '["positionManipulation"]',
    name_locale:
      '{"en":"Image Viewer","pt":"Visualizador de Imagens","zh":"图片查看器","es":"Visor de Imágenes","fr":"Visionneuse d’Images","de":"Bildbetrachter"}',
  },
  {
    id: "sys.next.appstore",
    name: "App Store",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    name_locale:
      '{"en":"App Store","pt":"Loja de Aplicações","zh":"应用商店","es":"Tienda de Aplicaciones","fr":"Boutique d’Applications","de":"App Store"}',
  },
  {
    id: "sys.next.settings",
    name: "Settings",
    version: "1.0.0",
    entry_point: "index.html",
    icon_path: "icon.png",
    name_locale:
      '{"en":"Settings","pt":"Definições","zh":"设置","es":"Ajustes","fr":"Paramètres","de":"Einstellungen"}',
  },
];

// --- LOGIC ---

function seedUserData(user_id) {
  db.serialize(() => {
    // 1. Seed Filetypes
    DEFAULT_FILETYPES.forEach(([app_id, ext]) => {
      db.run(
        `INSERT INTO filetypes (user_id, app_id, filetype, "default") VALUES (?, ?, ?, 1) ON CONFLICT DO NOTHING;`,
        [user_id, app_id, ext],
      );
    });

    // 2. Seed Settings
    DEFAULT_SETTINGS.forEach(([setting, value]) => {
      db.run(
        `INSERT INTO settings (user_id, setting, value) VALUES (?, ?, ?) ON CONFLICT DO NOTHING;`,
        [user_id, setting, value],
      );
    });

    // 3. Seed Apps (Dynamic generation based on object keys)
    DEFAULT_APPS.forEach((app) => {
      const keys = Object.keys(app);
      const values = Object.values(app);
      const placeholders = keys.map(() => "?").join(", ");

      db.run(
        `INSERT INTO apps (user_id, ${keys.join(", ")}) VALUES (?, ${placeholders}) ON CONFLICT(user_id, id) DO NOTHING;`,
        [user_id, ...values],
      );
    });
  });
}

module.exports = { db, seedUserData };
