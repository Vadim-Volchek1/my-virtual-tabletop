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

      // Включаем внешние ключи
      db.run('PRAGMA foreign_keys = ON');

      db.serialize(() => {
        // Существующие таблицы
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT,
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

        // 🔹 ОБНОВЛЕННАЯ СТРУКТУРА ПЕРСОНАЖА
        db.run(`
          CREATE TABLE IF NOT EXISTS dnd_characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            
            -- 1. Основная информация
            name TEXT NOT NULL,
            race TEXT NOT NULL,
            subrace TEXT,
            background TEXT,
            class TEXT NOT NULL,
            subclass TEXT,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            alignment TEXT,
            
            -- 3. Боевые параметры
            speed INTEGER DEFAULT 30,
            proficiency_bonus INTEGER DEFAULT 2,
            initiative INTEGER DEFAULT 0,
            passive_perception INTEGER DEFAULT 10,
            condition TEXT DEFAULT 'Нормальное',
            armor_class INTEGER DEFAULT 10,
            current_hp INTEGER DEFAULT 1,
            max_hp INTEGER DEFAULT 1,
            temporary_hp INTEGER DEFAULT 0,
            hit_dice TEXT DEFAULT '1d6',
            current_hit_dice INTEGER DEFAULT 1,
            death_saves_success INTEGER DEFAULT 0,
            death_saves_failure INTEGER DEFAULT 0,
            
            -- 6. Физические параметры
            size TEXT DEFAULT 'Средний',
            carrying_capacity INTEGER DEFAULT 0,
            jump_height INTEGER DEFAULT 0,
            jump_length INTEGER DEFAULT 0,
            
            -- 7. Деньги
            copper INTEGER DEFAULT 0,
            silver INTEGER DEFAULT 0,
            electrum INTEGER DEFAULT 0,
            gold INTEGER DEFAULT 0,
            platinum INTEGER DEFAULT 0,
            
            -- 8. Магия
            spellcasting_ability TEXT,
            spell_attack_bonus INTEGER DEFAULT 0,
            spell_save_dc INTEGER DEFAULT 8,
            
            -- 5. Внешность и описание
            portrait_url TEXT,
            appearance TEXT,
            personality_traits TEXT,
            ideals TEXT,
            bonds TEXT,
            flaws TEXT,
            backstory TEXT,
            notes TEXT,
            
            is_public BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // 2. Характеристики
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
            strength_mod INTEGER DEFAULT 0,
            dexterity_mod INTEGER DEFAULT 0,
            constitution_mod INTEGER DEFAULT 0,
            intelligence_mod INTEGER DEFAULT 0,
            wisdom_mod INTEGER DEFAULT 0,
            charisma_mod INTEGER DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 2. Навыки
        db.run(`
          CREATE TABLE IF NOT EXISTS character_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            ability TEXT NOT NULL,
            proficiency BOOLEAN DEFAULT 0,
            expertise BOOLEAN DEFAULT 0,
            bonus INTEGER DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 4. Способности, черты и умения
        db.run(`
          CREATE TABLE IF NOT EXISTS character_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            source TEXT, -- race, class, background, feat
            uses_per_day INTEGER,
            current_uses INTEGER,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 5. Владения
        db.run(`
          CREATE TABLE IF NOT EXISTS character_proficiencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- weapon, armor, tool, skill, saving_throw
            name TEXT NOT NULL,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 7. Инвентарь
        db.run(`
          CREATE TABLE IF NOT EXISTS character_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            type TEXT NOT NULL, -- weapon, armor, tool, consumable, gear
            quantity INTEGER DEFAULT 1,
            weight DECIMAL(10,2),
            description TEXT,
            equipped BOOLEAN DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 7. Оружие (специализированная таблица)
        db.run(`
          CREATE TABLE IF NOT EXISTS character_weapons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            damage_dice TEXT,
            damage_type TEXT,
            ability TEXT DEFAULT 'strength',
            attack_bonus INTEGER DEFAULT 0,
            range TEXT,
            properties TEXT,
            description TEXT,
            equipped BOOLEAN DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 8. Заклинания
        db.run(`
          CREATE TABLE IF NOT EXISTS character_spells (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            spell_name TEXT NOT NULL,
            spell_level INTEGER DEFAULT 0,
            school TEXT,
            prepared BOOLEAN DEFAULT 0,
            concentration BOOLEAN DEFAULT 0,
            ritual BOOLEAN DEFAULT 0,
            casting_time TEXT,
            range TEXT,
            components TEXT,
            duration TEXT,
            description TEXT,
            FOREIGN KEY (character_id) REFERENCES dnd_characters (id) ON DELETE CASCADE
          )
        `);

        // 8. Ячейки заклинаний
        db.run(`
          CREATE TABLE IF NOT EXISTS character_spell_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            level INTEGER NOT NULL,
            total INTEGER DEFAULT 0,
            used INTEGER DEFAULT 0,
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
          if (err) {
            console.error('Error checking users:', err);
            return reject(err);
          }
          
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
        }
        // ... остальные расы
      }
      // ... остальные конфиги
    };

    for (const [filename, data] of Object.entries(configFiles)) {
      const filepath = path.join(JSON_CONFIGS_PATH, filename);
      try {
        await fs.access(filepath);
        console.log(`✅ ${filename} already exists`);
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

  addToConfig: async (configName, key, value) => {
    const config = await jsonHelpers.readConfig(configName);
    config[key] = value;
    return await jsonHelpers.writeConfig(configName, config);
  },

  removeFromConfig: async (configName, key) => {
    const config = await jsonHelpers.readConfig(configName);
    delete config[key];
    return await jsonHelpers.writeConfig(configName, config);
  },

  searchInConfig: async (configName, searchTerm) => {
    const config = await jsonHelpers.readConfig(configName);
    const results = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase())) {
        results[key] = value;
      }
    }
    
    return results;
  },

  getConfigKeys: async (configName) => {
    const config = await jsonHelpers.readConfig(configName);
    return Object.keys(config);
  }
};

// 🔹 ФУНКЦИИ ДЛЯ РАБОТЫ С ПЕРСОНАЖАМИ
export const characterHelpers = {
  // Создание нового персонажа
  createCharacter: async (characterData) => {
    const {
      user_id, name, race, class: characterClass, level = 1,
      background, abilities = {}, subrace, subclass,
      max_hp = 10, current_hp = 10, armor_class = 10, 
      speed = 30, proficiency_bonus = 2, hit_dice = '1d8',
      copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0
    } = characterData;
  
    try {
      console.log('🎯 CHARACTER HELPER - CREATING CHARACTER:', characterData);
      
      // Рассчитываем опыт на основе уровня
      const experience = levelToExperience(level);
      
      const result = await dbHelpers.run(
        `INSERT INTO dnd_characters 
        (user_id, name, race, subrace, class, subclass, background, level, experience,
         max_hp, current_hp, armor_class, speed, proficiency_bonus, hit_dice,
         copper, silver, electrum, gold, platinum) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, 
          name, 
          race, 
          subrace || null, 
          characterClass, 
          subclass || null, 
          background || '', 
          level,
          experience,
          max_hp,
          current_hp, 
          armor_class,
          speed,
          proficiency_bonus,
          hit_dice,
          copper, silver, electrum, gold, platinum
        ]
      );

      const characterId = result.id;
      console.log('✅ CHARACTER CREATED WITH ID:', characterId);

      // Рассчитываем модификаторы характеристик
      const strength_mod = calculateAbilityModifier(abilities.strength || 10);
      const dexterity_mod = calculateAbilityModifier(abilities.dexterity || 10);
      const constitution_mod = calculateAbilityModifier(abilities.constitution || 10);
      const intelligence_mod = calculateAbilityModifier(abilities.intelligence || 10);
      const wisdom_mod = calculateAbilityModifier(abilities.wisdom || 10);
      const charisma_mod = calculateAbilityModifier(abilities.charisma || 10);

      // Добавляем характеристики
      await dbHelpers.run(
        `INSERT INTO character_abilities 
        (character_id, strength, dexterity, constitution, intelligence, wisdom, charisma,
         strength_mod, dexterity_mod, constitution_mod, intelligence_mod, wisdom_mod, charisma_mod) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          characterId,
          abilities.strength || 10,
          abilities.dexterity || 10,
          abilities.constitution || 10,
          abilities.intelligence || 10,
          abilities.wisdom || 10,
          abilities.charisma || 10,
          strength_mod,
          dexterity_mod,
          constitution_mod,
          intelligence_mod,
          wisdom_mod,
          charisma_mod
        ]
      );

      // Добавляем стандартные навыки
      const skills = await jsonHelpers.readConfig('skills');
      for (const [skillName, skillData] of Object.entries(skills)) {
        await dbHelpers.run(
          `INSERT INTO character_skills (character_id, skill_name, ability) VALUES (?, ?, ?)`,
          [characterId, skillName, skillData.ability]
        );
      }

      return characterId;
    } catch (error) {
      console.error('💥 CHARACTER HELPER ERROR:', error);
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

      const proficiencies = await dbHelpers.all(
        `SELECT * FROM character_proficiencies WHERE character_id = ?`,
        [characterId]
      );

      const inventory = await dbHelpers.all(
        `SELECT * FROM character_inventory WHERE character_id = ?`,
        [characterId]
      );

      const weapons = await dbHelpers.all(
        `SELECT * FROM character_weapons WHERE character_id = ?`,
        [characterId]
      );

      const spells = await dbHelpers.all(
        `SELECT * FROM character_spells WHERE character_id = ?`,
        [characterId]
      );

      const spellSlots = await dbHelpers.all(
        `SELECT * FROM character_spell_slots WHERE character_id = ?`,
        [characterId]
      );

      return {
        // 1. Основная информация
        basic_info: {
          id: character.id,
          user_id: character.user_id,
          name: character.name,
          race: character.race,
          subrace: character.subrace,
          background: character.background,
          class: character.class,
          subclass: character.subclass,
          level: character.level,
          experience: character.experience,
          alignment: character.alignment
        },

        // 2. Характеристики и навыки
        abilities: abilities || {},
        skills: skills || [],

        // 3. Боевые параметры
        combat: {
          speed: character.speed,
          proficiency_bonus: character.proficiency_bonus,
          initiative: character.initiative,
          passive_perception: character.passive_perception,
          condition: character.condition,
          armor_class: character.armor_class,
          hit_points: {
            current: character.current_hp,
            max: character.max_hp,
            temporary: character.temporary_hp
          },
          hit_dice: character.hit_dice,
          current_hit_dice: character.current_hit_dice,
          death_saves: {
            success: character.death_saves_success,
            failure: character.death_saves_failure
          }
        },

        // 4. Способности и черты
        features: features || [],

        // 5. Владения
        proficiencies: proficiencies || [],

        // 6. Физические параметры
        physical: {
          size: character.size,
          carrying_capacity: character.carrying_capacity,
          jump_height: character.jump_height,
          jump_length: character.jump_length
        },

        // 7. Экономика и экипировка
        economy: {
          copper: character.copper,
          silver: character.silver,
          electrum: character.electrum,
          gold: character.gold,
          platinum: character.platinum
        },
        inventory: inventory || [],
        weapons: weapons || [],

        // 8. Магия
        magic: {
          spellcasting_ability: character.spellcasting_ability,
          spell_attack_bonus: character.spell_attack_bonus,
          spell_save_dc: character.spell_save_dc,
          spells: spells || [],
          spell_slots: spellSlots || []
        },

        // 9. Описание и внешность
        description: {
          portrait_url: character.portrait_url,
          appearance: character.appearance,
          personality_traits: character.personality_traits,
          ideals: character.ideals,
          bonds: character.bonds,
          flaws: character.flaws,
          backstory: character.backstory,
          notes: character.notes
        },

        meta: {
          is_public: character.is_public,
          created_at: character.created_at,
          updated_at: character.updated_at
        }
      };
    } catch (error) {
      console.error('Error getting character:', error);
      throw error;
    }
  },

  // Получение всех персонажей пользователя
  getUserCharacters: async (userId) => {
    return await dbHelpers.all(
      `SELECT id, name, race, class, level, experience, background, portrait_url, is_public, created_at, updated_at 
       FROM dnd_characters WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  },

  // Обновление характеристик персонажа
  updateAbilities: async (characterId, abilities) => {
    // Рассчитываем новые модификаторы
    const strength_mod = calculateAbilityModifier(abilities.strength);
    const dexterity_mod = calculateAbilityModifier(abilities.dexterity);
    const constitution_mod = calculateAbilityModifier(abilities.constitution);
    const intelligence_mod = calculateAbilityModifier(abilities.intelligence);
    const wisdom_mod = calculateAbilityModifier(abilities.wisdom);
    const charisma_mod = calculateAbilityModifier(abilities.charisma);

    return await dbHelpers.run(
      `UPDATE character_abilities 
       SET strength = ?, dexterity = ?, constitution = ?, intelligence = ?, wisdom = ?, charisma = ?,
           strength_mod = ?, dexterity_mod = ?, constitution_mod = ?, intelligence_mod = ?, wisdom_mod = ?, charisma_mod = ?
       WHERE character_id = ?`,
      [
        abilities.strength,
        abilities.dexterity,
        abilities.constitution,
        abilities.intelligence,
        abilities.wisdom,
        abilities.charisma,
        strength_mod,
        dexterity_mod,
        constitution_mod,
        intelligence_mod,
        wisdom_mod,
        charisma_mod,
        characterId
      ]
    );
  },

  // Добавление заклинания персонажу
  addSpell: async (characterId, spellData) => {
    return await dbHelpers.run(
      `INSERT INTO character_spells 
      (character_id, spell_name, spell_level, school, prepared, concentration, ritual, 
       casting_time, range, components, duration, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        characterId, 
        spellData.name || spellData.spell_name, 
        spellData.level || spellData.spell_level || 0, 
        spellData.school,
        spellData.prepared || 0, 
        spellData.concentration || 0, 
        spellData.ritual || 0,
        spellData.casting_time, 
        spellData.range, 
        spellData.components,
        spellData.duration, 
        spellData.description
      ]
    );
  },

  // Добавление предмета в инвентарь
  addItem: async (characterId, itemData) => {
    return await dbHelpers.run(
      `INSERT INTO character_inventory 
      (character_id, item_name, type, quantity, weight, description, equipped) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        characterId,
        itemData.name || itemData.item_name,
        itemData.type || 'gear',
        itemData.quantity || 1,
        itemData.weight || 0,
        itemData.description || '',
        itemData.equipped || 0
      ]
    );
  },

  // Обновление персонажа
  updateCharacter: async (characterId, updateData) => {
    const {
      basic_info, abilities, combat, economy
    } = updateData;

    try {
      // Обновляем основную таблицу
      if (basic_info) {
        await dbHelpers.run(
          `UPDATE dnd_characters SET 
            name = ?, race = ?, subrace = ?, background = ?, class = ?, subclass = ?, 
            level = ?, experience = ?, alignment = ?,
            updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [
            basic_info.name, 
            basic_info.race, 
            basic_info.subrace, 
            basic_info.background,
            basic_info.class, 
            basic_info.subclass, 
            basic_info.level || 1,
            basic_info.experience || 0,
            basic_info.alignment || '',
            characterId
          ]
        );
      }

      // Обновляем боевые параметры
      if (combat) {
        await dbHelpers.run(
          `UPDATE dnd_characters SET
            speed = ?, proficiency_bonus = ?, initiative = ?, passive_perception = ?, condition = ?,
            armor_class = ?, current_hp = ?, max_hp = ?, temporary_hp = ?, hit_dice = ?,
            current_hit_dice = ?, death_saves_success = ?, death_saves_failure = ?
            WHERE id = ?`,
          [
            combat.speed, 
            combat.proficiency_bonus, 
            combat.initiative, 
            combat.passive_perception,
            combat.condition, 
            combat.armor_class, 
            combat.hit_points?.current, 
            combat.hit_points?.max,
            combat.hit_points?.temporary, 
            combat.hit_dice, 
            combat.current_hit_dice,
            combat.death_saves?.success, 
            combat.death_saves?.failure, 
            characterId
          ]
        );
      }

      // Обновляем характеристики
      if (abilities) {
        await characterHelpers.updateAbilities(characterId, abilities);
      }

      // Обновляем деньги
      if (economy) {
        await dbHelpers.run(
          `UPDATE dnd_characters SET
            copper = ?, silver = ?, electrum = ?, gold = ?, platinum = ?
            WHERE id = ?`,
          [
            economy.copper, 
            economy.silver, 
            economy.electrum, 
            economy.gold, 
            economy.platinum, 
            characterId
          ]
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  },

  // Поиск персонажей по имени
  searchCharacters: async (userId, searchTerm) => {
    return await dbHelpers.all(
      `SELECT id, name, race, class, level, portrait_url 
       FROM dnd_characters 
       WHERE user_id = ? AND name LIKE ? 
       ORDER BY name`,
      [userId, `%${searchTerm}%`]
    );
  },

  // Получение публичных персонажей
  getPublicCharacters: async (limit = 50) => {
    return await dbHelpers.all(
      `SELECT id, name, race, class, level, background, portrait_url, created_at 
       FROM dnd_characters 
       WHERE is_public = 1 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );
  }
};

// 🔹 ОСНОВНЫЕ ХЕЛПЕРЫ БАЗЫ ДАННЫХ
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

  // Закрытие соединения с базой данных
  close: () => new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else {
          console.log('✅ Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  })
};

// 🔹 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function levelToExperience(level) {
  const levels = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
  if (level < 1) return 0;
  if (level > 20) return levels[19];
  return levels[level - 1];
}

function calculateLevel(experience) {
  const levels = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i]) return i + 1;
  }
  return 1;
}

// Функция для расчета бонуса мастерства на основе уровня
export function calculateProficiencyBonus(level) {
  return Math.floor((level - 1) / 4) + 2;
}

// Функция для расчета модификатора характеристики
export function calculateAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}