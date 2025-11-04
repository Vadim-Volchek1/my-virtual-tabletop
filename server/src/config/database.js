import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

let db;

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return reject(err);
      }

      console.log('✅ Connected to SQLite database');

      db.serialize(() => {
        // Существующие таблицы
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            creator_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT,
            x INTEGER DEFAULT 0,
            y INTEGER DEFAULT 0
          )
        `);

        // 🔹 НОВЫЕ ТАБЛИЦЫ ДЛЯ D&D ПЕРСОНАЖЕЙ
        db.run(`
          CREATE TABLE IF NOT EXISTS dnd_characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            race TEXT NOT NULL,
            class TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            background TEXT,
            alignment TEXT,
            experience INTEGER DEFAULT 0,
            avatar_url TEXT,
            is_public BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS character_abilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            strength INTEGER DEFAULT 10,
            dexterity INTEGER DEFAULT 10,
            constitution INTEGER DEFAULT 10,
            intelligence INTEGER DEFAULT 10,
            wisdom INTEGER DEFAULT 10,
            charisma INTEGER DEFAULT 10,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS character_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            proficiency BOOLEAN DEFAULT 0,
            expertise BOOLEAN DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS character_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            uses_per_day INTEGER,
            current_uses INTEGER,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS character_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            weight DECIMAL(10,2),
            description TEXT,
            equipped BOOLEAN DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS character_spells (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            spell_name TEXT NOT NULL,
            spell_level INTEGER DEFAULT 0,
            prepared BOOLEAN DEFAULT 0,
            description TEXT,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 🔹 Проверяем, есть ли колонка avatar в users
        db.all(`PRAGMA table_info(users)`, async (err, columns) => {
          if (err) {
            console.error('Error checking users table:', err);
            return reject(err);
          }

          const hasAvatar = columns.some((col) => col.name === 'avatar');
          if (!hasAvatar) {
            db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, (alterErr) => {
              if (alterErr) console.error('⚠️ Error adding avatar column:', alterErr);
              else console.log('✅ Added missing "avatar" column to users table');
            });
          }
        });

        // Создание тестового пользователя, если таблица пуста
        db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
          if (row.count === 0) {
            const hashed = await bcrypt.hash('password123', 12);
            db.run(
              'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
              ['testuser', 'test@test.com', hashed]
            );
            console.log('👤 Created test user: test@test.com / password123');
          }
          
          // Инициализация JSON конфигураций
          await initializeJSONConfigs();
          resolve();
        });
      });
    });
  });
}

// 🔹 ФУНКЦИИ ДЛЯ РАБОТЫ С JSON КОНФИГУРАЦИЯМИ
const JSON_CONFIGS_PATH = './dnd_configs';

async function initializeJSONConfigs() {
  try {
    await fs.mkdir(JSON_CONFIGS_PATH, { recursive: true });
    
    const configFiles = {
      'races.json': {
        human: {
          name: "Человек",
          ability_bonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
          speed: 30,
          features: ["Универсальная обучаемость"]
        },
        elf: {
          name: "Эльф",
          ability_bonuses: { dexterity: 2 },
          speed: 30,
          features: ["Тёмное зрение", "Острослышание", "Транс"]
        },
        dwarf: {
          name: "Дварф",
          ability_bonuses: { constitution: 2 },
          speed: 25,
          features: ["Тёмное зрение", "Стойкость дварфов"]
        }
      },
      
      'classes.json': {
        fighter: {
          name: "Воин",
          hit_die: 10,
          primary_ability: ["strength", "dexterity"],
          saving_throws: ["strength", "constitution"]
        },
        wizard: {
          name: "Волшебник",
          hit_die: 6,
          primary_ability: ["intelligence"],
          saving_throws: ["intelligence", "wisdom"]
        },
        rogue: {
          name: "Плут",
          hit_die: 8,
          primary_ability: ["dexterity"],
          saving_throws: ["dexterity", "intelligence"]
        }
      },
      
      'skills.json': {
        "Acrobatics": { ability: "dexterity", description: "Ловкость тела, акробатика" },
        "Animal Handling": { ability: "wisdom", description: "Уход за животными" },
        "Arcana": { ability: "intelligence", description: "Магические знания" },
        "Athletics": { ability: "strength", description: "Физическая сила" },
        "Deception": { ability: "charisma", description: "Обман" },
        "History": { ability: "intelligence", description: "Исторические знания" },
        "Insight": { ability: "wisdom", description: "Проницательность" },
        "Intimidation": { ability: "charisma", description: "Запугивание" },
        "Investigation": { ability: "intelligence", description: "Расследование" },
        "Medicine": { ability: "wisdom", description: "Медицина" },
        "Nature": { ability: "intelligence", description: "Природа" },
        "Perception": { ability: "wisdom", description: "Внимательность" },
        "Performance": { ability: "charisma", description: "Выступление" },
        "Persuasion": { ability: "charisma", description: "Убеждение" },
        "Religion": { ability: "intelligence", description: "Религия" },
        "Sleight of Hand": { ability: "dexterity", description: "Ловкость рук" },
        "Stealth": { ability: "dexterity", description: "Скрытность" },
        "Survival": { ability: "wisdom", description: "Выживание" }
      },
      
      'spells.json': {
        "Fire Bolt": {
          level: 0,
          school: "Evocation",
          casting_time: "1 action",
          range: "120 feet",
          components: "V, S",
          duration: "Instantaneous"
        },
        "Magic Missile": {
          level: 1,
          school: "Evocation",
          casting_time: "1 action",
          range: "120 feet",
          components: "V, S",
          duration: "Instantaneous"
        }
      },
      
      'items.json': {
        "Longsword": {
          type: "weapon",
          cost: "15 gp",
          weight: 3,
          damage: "1d8 slashing",
          properties: ["Versatile (1d10)"]
        },
        "Leather Armor": {
          type: "armor",
          cost: "10 gp",
          weight: 10,
          armor_class: 11
        },
        "Healing Potion": {
          type: "potion",
          cost: "50 gp",
          weight: 0.5,
          description: "Восстанавливает 2d4+2 хитов"
        }
      }
    };

    for (const [filename, data] of Object.entries(configFiles)) {
      const filepath = path.join(JSON_CONFIGS_PATH, filename);
      try {
        await fs.access(filepath);
      } catch {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Created ${filename}`);
      }
    }
  } catch (error) {
    console.error('Error initializing JSON configs:', error);
  }
}

// 🔹 ФУНКЦИИ ДЛЯ РАБОТЫ С JSON
export const jsonHelpers = {
  // Чтение JSON файла
  readConfig: async (configName) => {
    try {
      const filepath = path.join(JSON_CONFIGS_PATH, `${configName}.json`);
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${configName}:`, error);
      return {};
    }
  },

  // Запись в JSON файл
  writeConfig: async (configName, data) => {
    try {
      const filepath = path.join(JSON_CONFIGS_PATH, `${configName}.json`);
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${configName}:`, error);
      return false;
    }
  },

  // Добавление элемента в JSON конфиг
  addToConfig: async (configName, key, value) => {
    const config = await jsonHelpers.readConfig(configName);
    config[key] = value;
    return await jsonHelpers.writeConfig(configName, config);
  }
};

// 🔹 ФУНКЦИИ ДЛЯ РАБОТЫ С ПЕРСОНАЖАМИ
export const characterHelpers = {
  // Создание нового персонажа
  createCharacter: async (characterData) => {
    const {
      user_id, name, race, class: characterClass, level = 1,
      background, alignment, abilities = {}
    } = characterData;

    try {
      const result = await dbHelpers.run(
        `INSERT INTO dnd_characters (user_id, name, race, class, level, background, alignment) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, name, race, characterClass, level, background, alignment]
      );

      const characterId = result.id;

      // Добавляем характеристики
      await dbHelpers.run(
        `INSERT INTO character_abilities (character_id, strength, dexterity, constitution, intelligence, wisdom, charisma) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          characterId,
          abilities.strength || 10,
          abilities.dexterity || 10,
          abilities.constitution || 10,
          abilities.intelligence || 10,
          abilities.wisdom || 10,
          abilities.charisma || 10
        ]
      );

      // Добавляем стандартные навыки
      const skills = await jsonHelpers.readConfig('skills');
      for (const skillName of Object.keys(skills)) {
        await dbHelpers.run(
          `INSERT INTO character_skills (character_id, skill_name) VALUES (?, ?)`,
          [characterId, skillName]
        );
      }

      return characterId;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  },

  // Получение полной информации о персонаже
  getCharacter: async (characterId) => {
    try {
      const character = await dbHelpers.get(
        `SELECT * FROM dnd_characters WHERE id = ?`,
        [characterId]
      );

      if (!character) return null;

      const abilities = await dbHelpers.get(
        `SELECT * FROM character_abilities WHERE character_id = ?`,
        [characterId]
      );

      const skills = await dbHelpers.all(
        `SELECT * FROM character_skills WHERE character_id = ?`,
        [characterId]
      );

      const features = await dbHelpers.all(
        `SELECT * FROM character_features WHERE character_id = ?`,
        [characterId]
      );

      const inventory = await dbHelpers.all(
        `SELECT * FROM character_inventory WHERE character_id = ?`,
        [characterId]
      );

      const spells = await dbHelpers.all(
        `SELECT * FROM character_spells WHERE character_id = ?`,
        [characterId]
      );

      return {
        ...character,
        abilities,
        skills,
        features,
        inventory,
        spells
      };
    } catch (error) {
      console.error('Error getting character:', error);
      throw error;
    }
  },

  // Получение всех персонажей пользователя
  getUserCharacters: async (userId) => {
    return await dbHelpers.all(
      `SELECT * FROM dnd_characters WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  },

  // Обновление характеристик персонажа
  updateAbilities: async (characterId, abilities) => {
    return await dbHelpers.run(
      `UPDATE character_abilities 
       SET strength = ?, dexterity = ?, constitution = ?, intelligence = ?, wisdom = ?, charisma = ?
       WHERE character_id = ?`,
      [
        abilities.strength,
        abilities.dexterity,
        abilities.constitution,
        abilities.intelligence,
        abilities.wisdom,
        abilities.charisma,
        characterId
      ]
    );
  },

  // Добавление заклинания персонажу
  addSpell: async (characterId, spellData) => {
    return await dbHelpers.run(
      `INSERT INTO character_spells (character_id, spell_name, spell_level, prepared, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [characterId, spellData.spell_name, spellData.spell_level, spellData.prepared || 0, spellData.description]
    );
  },

  // Добавление предмета в инвентарь
  addItem: async (characterId, itemData) => {
    return await dbHelpers.run(
      `INSERT INTO character_inventory (character_id, item_name, quantity, weight, description, equipped) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        characterId,
        itemData.item_name,
        itemData.quantity || 1,
        itemData.weight || 0,
        itemData.description,
        itemData.equipped || 0
      ]
    );
  }
};

export const dbHelpers = {
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  }),

  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  }),

  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  }),
};