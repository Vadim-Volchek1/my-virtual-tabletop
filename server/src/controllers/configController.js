import { jsonHelpers } from '../config/database.js';
import { CharacterService } from '../services/characterService.js';

export const configController = {
  /**
   * Получение всех конфигураций
   * Использование: Загрузка всех доступных опций при создании персонажа
   */
  getAllConfigs: async (req, res) => {
    try {
      const options = await CharacterService.getAvailableOptions();
      
      res.json({
        message: 'Все конфигурации загружены',
        configs: options,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get all configs error:', error);
      res.status(500).json({ 
        error: 'Ошибка при загрузке конфигураций',
        details: error.message 
      });
    }
  },

  /**
   * Получение конкретной конфигурации
   * Использование: Получить только расы или только заклинания
   */
  getConfig: async (req, res) => {
    try {
      const { configName } = req.params;
      
      // Список допустимых конфигов
      const allowedConfigs = ['races', 'classes', 'skills', 'spells', 'items', 'feats'];
      
      if (!allowedConfigs.includes(configName)) {
        return res.status(400).json({ 
          error: 'Недопустимое имя конфигурации',
          allowed: allowedConfigs
        });
      }

      const config = await jsonHelpers.readConfig(configName);
      
      if (Object.keys(config).length === 0) {
        return res.status(404).json({ 
          error: 'Конфигурация не найдена или пуста' 
        });
      }

      res.json({
        message: `Конфигурация ${configName} загружена`,
        config,
        count: Object.keys(config).length
      });
    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({ 
        error: 'Ошибка при загрузке конфигурации',
        details: error.message 
      });
    }
  },

  /**
   * Добавление новой расы
   * Использование: Админ добавляет новую расу в игру
   */
  addRace: async (req, res) => {
    try {
      const { raceKey, raceData } = req.body;

      // Валидация
      if (!raceKey || !raceData) {
        return res.status(400).json({ 
          error: 'raceKey и raceData обязательны' 
        });
      }

      if (!raceData.name || !raceData.ability_bonuses) {
        return res.status(400).json({ 
          error: 'raceData должен содержать name и ability_bonuses' 
        });
      }

      // Проверяем, не существует ли уже такая раса
      const races = await jsonHelpers.readConfig('races');
      if (races[raceKey]) {
        return res.status(409).json({ 
          error: 'Раса с таким ключом уже существует' 
        });
      }

      const success = await jsonHelpers.addToConfig('races', raceKey, raceData);

      if (!success) {
        return res.status(500).json({ 
          error: 'Ошибка при сохранении расы' 
        });
      }

      res.status(201).json({
        message: 'Раса успешно добавлена',
        race: raceData,
        key: raceKey
      });
    } catch (error) {
      console.error('Add race error:', error);
      res.status(500).json({ 
        error: 'Ошибка при добавлении расы',
        details: error.message 
      });
    }
  },

  /**
   * Добавление нового класса
   * Использование: Админ добавляет новый класс в игру
   */
  addClass: async (req, res) => {
    try {
      const { classKey, classData } = req.body;

      if (!classKey || !classData) {
        return res.status(400).json({ 
          error: 'classKey и classData обязательны' 
        });
      }

      if (!classData.name || !classData.hit_die || !classData.primary_ability) {
        return res.status(400).json({ 
          error: 'classData должен содержать name, hit_die и primary_ability' 
        });
      }

      // Проверяем существование класса
      const classes = await jsonHelpers.readConfig('classes');
      if (classes[classKey]) {
        return res.status(409).json({ 
          error: 'Класс с таким ключом уже существует' 
        });
      }

      const success = await jsonHelpers.addToConfig('classes', classKey, classData);

      if (!success) {
        return res.status(500).json({ 
          error: 'Ошибка при сохранении класса' 
        });
      }

      res.status(201).json({
        message: 'Класс успешно добавлен',
        class: classData,
        key: classKey
      });
    } catch (error) {
      console.error('Add class error:', error);
      res.status(500).json({ 
        error: 'Ошибка при добавлении класса',
        details: error.message 
      });
    }
  },

  /**
   * Добавление нового заклинания
   * Использование: Админ добавляет новое заклинание
   */
  addSpell: async (req, res) => {
    try {
      const { spellKey, spellData } = req.body;

      if (!spellKey || !spellData) {
        return res.status(400).json({ 
          error: 'spellKey и spellData обязательны' 
        });
      }

      if (!spellData.name || spellData.level === undefined) {
        return res.status(400).json({ 
          error: 'spellData должен содержать name и level' 
        });
      }

      const spells = await jsonHelpers.readConfig('spells');
      if (spells[spellKey]) {
        return res.status(409).json({ 
          error: 'Заклинание с таким ключом уже существует' 
        });
      }

      const success = await jsonHelpers.addToConfig('spells', spellKey, spellData);

      if (!success) {
        return res.status(500).json({ 
          error: 'Ошибка при сохранении заклинания' 
        });
      }

      res.status(201).json({
        message: 'Заклинание успешно добавлено',
        spell: spellData,
        key: spellKey
      });
    } catch (error) {
      console.error('Add spell error:', error);
      res.status(500).json({ 
        error: 'Ошибка при добавлении заклинания',
        details: error.message 
      });
    }
  },

  /**
   * Добавление нового предмета
   * Использование: Админ добавляет новый предмет в игру
   */
  addItem: async (req, res) => {
    try {
      const { itemKey, itemData } = req.body;

      if (!itemKey || !itemData) {
        return res.status(400).json({ 
          error: 'itemKey и itemData обязательны' 
        });
      }

      if (!itemData.name || !itemData.type) {
        return res.status(400).json({ 
          error: 'itemData должен содержать name и type' 
        });
      }

      const items = await jsonHelpers.readConfig('items');
      if (items[itemKey]) {
        return res.status(409).json({ 
          error: 'Предмет с таким ключом уже существует' 
        });
      }

      const success = await jsonHelpers.addToConfig('items', itemKey, itemData);

      if (!success) {
        return res.status(500).json({ 
          error: 'Ошибка при сохранении предмета' 
        });
      }

      res.status(201).json({
        message: 'Предмет успешно добавлен',
        item: itemData,
        key: itemKey
      });
    } catch (error) {
      console.error('Add item error:', error);
      res.status(500).json({ 
        error: 'Ошибка при добавлении предмета',
        details: error.message 
      });
    }
  },

  /**
   * Обновление существующей конфигурации
   * Использование: Редактирование существующих рас/классов
   */
  updateConfig: async (req, res) => {
    try {
      const { configName } = req.params;
      const { key, data } = req.body;

      if (!configName || !key || !data) {
        return res.status(400).json({ 
          error: 'configName, key и data обязательны' 
        });
      }

      const allowedConfigs = ['races', 'classes', 'skills', 'spells', 'items', 'feats'];
      if (!allowedConfigs.includes(configName)) {
        return res.status(400).json({ 
          error: 'Недопустимое имя конфигурации',
          allowed: allowedConfigs
        });
      }

      const config = await jsonHelpers.readConfig(configName);
      
      if (!config[key]) {
        return res.status(404).json({ 
          error: `Элемент с ключом ${key} не найден в ${configName}` 
        });
      }

      // Обновляем данные
      config[key] = { ...config[key], ...data };
      
      const success = await jsonHelpers.writeConfig(configName, config);

      if (!success) {
        return res.status(500).json({ 
          error: 'Ошибка при обновлении конфигурации' 
        });
      }

      res.json({
        message: 'Конфигурация успешно обновлена',
        key,
        data: config[key]
      });
    } catch (error) {
      console.error('Update config error:', error);
      res.status(500).json({ 
        error: 'Ошибка при обновлении конфигурации',
        details: error.message 
      });
    }
  },

  /**
   * Получение статистики по конфигурациям
   * Использование: Админ-панель для просмотра состояния
   */
  getStats: async (req, res) => {
    try {
      const [races, classes, skills, spells, items] = await Promise.all([
        jsonHelpers.readConfig('races'),
        jsonHelpers.readConfig('classes'),
        jsonHelpers.readConfig('skills'),
        jsonHelpers.readConfig('spells'),
        jsonHelpers.readConfig('items')
      ]);

      const stats = {
        races: { count: Object.keys(races).length },
        classes: { count: Object.keys(classes).length },
        skills: { count: Object.keys(skills).length },
        spells: { count: Object.keys(spells).length },
        items: { count: Object.keys(items).length },
        total: Object.keys(races).length + Object.keys(classes).length + 
               Object.keys(skills).length + Object.keys(spells).length + 
               Object.keys(items).length
      };

      res.json({
        message: 'Статистика конфигураций',
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get config stats error:', error);
      res.status(500).json({ 
        error: 'Ошибка при получении статистики',
        details: error.message 
      });
    }
  }
};

export default configController;