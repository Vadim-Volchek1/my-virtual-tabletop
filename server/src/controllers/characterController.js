import { characterHelpers } from '../config/database.js';
import { dbHelpers } from '../config/database.js';

export const characterController = {
  // 🔹 Создание нового персонажа
  async createCharacter(req, res) {
    try {
      console.log('📝 CREATE CHARACTER REQUEST BODY:', req.body);
      console.log('👤 USER ID:', req.user.id);
      
      const userId = req.user.id;
      
      // Проверка обязательных полей
      const requiredFields = ['name', 'race', 'class'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Отсутствуют обязательные поля: ${missingFields.join(', ')}`
        });
      }

      // Рассчитываем значения по умолчанию
      const level = req.body.level || 1;
      const maxHp = req.body.max_hp || calculateDefaultHP(level, req.body.class, req.body.abilities?.constitution || 10);
      const proficiencyBonus = calculateProficiencyBonus(level);
      
      // Подготавливаем данные для создания персонажа с полными значениями по умолчанию
      const characterData = {
        user_id: userId,
        name: req.body.name,
        race: req.body.race,
        class: req.body.class,
        level: level,
        background: req.body.background || '',
        alignment: req.body.alignment || '',
        subrace: req.body.subrace || null,
        subclass: req.body.subclass || null,
        
        // Характеристики с значениями по умолчанию
        abilities: req.body.abilities || {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        
        // Боевые параметры с значениями по умолчанию
        max_hp: maxHp,
        current_hp: req.body.current_hp || maxHp,
        armor_class: req.body.armor_class || 10,
        speed: req.body.speed || 30,
        proficiency_bonus: proficiencyBonus,
        hit_dice: req.body.hit_dice || calculateHitDice(level, req.body.class),
        current_hit_dice: level,
        initiative: req.body.initiative || 0,
        passive_perception: req.body.passive_perception || 10,
        
        // Экономика с значениями по умолчанию
        copper: req.body.copper || 0,
        silver: req.body.silver || 0,
        electrum: req.body.electrum || 0,
        gold: req.body.gold || 0,
        platinum: req.body.platinum || 0,
      };

      console.log('🎯 FINAL CHARACTER DATA FOR DB:', characterData);

      const characterId = await characterHelpers.createCharacter(characterData);
      
      // Получаем созданного персонажа для ответа
      const character = await characterHelpers.getCharacter(characterId);
      
      console.log('✅ CHARACTER CREATED SUCCESSFULLY:', characterId);
      
      res.status(201).json({
        success: true,
        message: 'Персонаж успешно создан',
        data: character
      });
    } catch (error) {
      console.error('💥 CREATE CHARACTER ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании персонажа',
        error: error.message
      });
    }
  },

  // 🔹 Получение всех персонажей пользователя
  async getUserCharacters(req, res) {
    try {
      const userId = req.user.id;
      console.log(`📋 GET USER CHARACTERS for user: ${userId}`);
      console.log('🧩 req.user:', req.user);
      console.log('📋 userId передан в getUserCharacters:', userId);
      const characters = await characterHelpers.getUserCharacters(userId);
      
      res.json({
        success: true,
        data: characters
      });
    } catch (error) {
      console.error('Error getting user characters:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка персонажей',
        error: error.message
      });
    }
  },
  // 🔹 Получение одного персонажа по ID
async getCharacter(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log('👤 USER ID:', req.user.id);
    const character = await characterHelpers.getCharacter(id);
    console.log('👤 req.user.id:', req.user.id);
    console.log('🧙 character.user_id:', character.basic_info.user_id);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Персонаж не найден'
      });
    }

    if (character.basic_info.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к этому персонажу'
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении персонажа',
      error: error.message
    });
  }
},

  // 🔹 Обновление персонажа
  async updateCharacter(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      console.log(`✏️ UPDATE CHARACTER: ${id} for user: ${userId}`, updateData);

      // Проверяем владение персонажем
      const character = await dbHelpers.get(
        'SELECT user_id FROM dnd_characters WHERE id = ?',
        [id]
      );

      if (!character) {
        return res.status(404).json({
          success: false,
          message: 'Персонаж не найден'
        });
      }

      if (character.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Нет прав для редактирования этого персонажа'
        });
      }

      await characterHelpers.updateCharacter(id, updateData);
      
      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);
      
      res.json({
        success: true,
        message: 'Персонаж успешно обновлен',
        data: updatedCharacter
      });
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении персонажа',
        error: error.message
      });
    }
  },

  // 🔹 Удаление персонажа
  async deleteCharacter(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log(`🗑️ DELETE CHARACTER: ${id} for user: ${userId}`);

      // Проверяем владение персонажем
      const character = await dbHelpers.get(
        'SELECT user_id FROM dnd_characters WHERE id = ?',
        [id]
      );

      if (!character) {
        return res.status(404).json({
          success: false,
          message: 'Персонаж не найден'
        });
      }

      if (character.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Нет прав для удаления этого персонажа'
        });
      }

      await dbHelpers.run('DELETE FROM dnd_characters WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Персонаж успешно удален'
      });
    } catch (error) {
      console.error('Error deleting character:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении персонажа',
        error: error.message
      });
    }
  },

  // 🔹 Добавление предмета в инвентарь
  async addItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const itemData = req.body;

      console.log(`🎒 ADD ITEM to character: ${id}`, itemData);

      await checkCharacterOwnership(id, userId);

      await characterHelpers.addItem(id, itemData);

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Предмет добавлен в инвентарь',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'добавлении предмета');
    }
  },

  // 🔹 Обновление предмета
  async updateItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      await checkCharacterOwnership(id, userId);

      await dbHelpers.run(
        `UPDATE character_inventory SET 
        item_name = ?, type = ?, quantity = ?, weight = ?, description = ?, equipped = ?
        WHERE id = ? AND character_id = ?`,
        [
          updateData.name || updateData.item_name,
          updateData.type || 'gear',
          updateData.quantity || 1,
          updateData.weight || 0,
          updateData.description || '',
          updateData.equipped || 0,
          itemId, id
        ]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Предмет обновлен',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'обновлении предмета');
    }
  },

  // 🔹 Удаление предмета
  async removeItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const userId = req.user.id;

      await checkCharacterOwnership(id, userId);

      await dbHelpers.run(
        'DELETE FROM character_inventory WHERE id = ? AND character_id = ?',
        [itemId, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Предмет удален из инвентаря',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'удалении предмета');
    }
  },

  // 🔹 Добавление оружия
  async addWeapon(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const weaponData = req.body;

      await checkCharacterOwnership(id, userId);

      const result = await dbHelpers.run(
        `INSERT INTO character_weapons 
        (character_id, name, damage_dice, damage_type, ability, attack_bonus, range, properties, description, equipped) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, 
          weaponData.name, 
          weaponData.damage_dice,
          weaponData.damage_type,
          weaponData.ability || 'strength', 
          weaponData.attack_bonus || 0,
          weaponData.range, 
          weaponData.properties, 
          weaponData.description,
          weaponData.equipped || 0
        ]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Оружие добавлено',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'добавлении оружия');
    }
  },

  // 🔹 Добавление заклинания
  async addSpell(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const spellData = req.body;

      await checkCharacterOwnership(id, userId);

      await characterHelpers.addSpell(id, spellData);

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Заклинание добавлено',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'добавлении заклинания');
    }
  },

  // 🔹 Добавление черты/особенности
  async addFeature(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const featureData = req.body;

      await checkCharacterOwnership(id, userId);

      const result = await dbHelpers.run(
        `INSERT INTO character_features 
        (character_id, name, description, source, uses_per_day, current_uses, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id, 
          featureData.name, 
          featureData.description, 
          featureData.source,
          featureData.uses_per_day, 
          featureData.current_uses || 0,
          featureData.is_active !== undefined ? featureData.is_active : 1
        ]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Черта добавлена',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'добавлении черты');
    }
  },

  // 🔹 Экипировка предмета
  async equipItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { itemId } = req.body;

      await checkCharacterOwnership(id, userId);

      await dbHelpers.run(
        'UPDATE character_inventory SET equipped = 1 WHERE id = ? AND character_id = ?',
        [itemId, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Предмет экипирован',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'экипировке предмета');
    }
  },

  // 🔹 Снятие предмета
  async unequipItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { itemId } = req.body;

      await checkCharacterOwnership(id, userId);

      await dbHelpers.run(
        'UPDATE character_inventory SET equipped = 0 WHERE id = ? AND character_id = ?',
        [itemId, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Предмет снят',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'снятии предмета');
    }
  },

  // 🔹 Подготовка заклинания
  async prepareSpell(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { spellId } = req.body;

      await checkCharacterOwnership(id, userId);

      await dbHelpers.run(
        'UPDATE character_spells SET prepared = 1 WHERE id = ? AND character_id = ?',
        [spellId, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Заклинание подготовлено',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'подготовке заклинания');
    }
  },

  // 🔹 Отмена подготовки заклинания
  async unprepareSpell(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { spellId } = req.body;

      await checkCharacterOwnership(id, userId);

      await dbHelpers.run(
        'UPDATE character_spells SET prepared = 0 WHERE id = ? AND character_id = ?',
        [spellId, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Заклинание снято с подготовки',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'снятии заклинания с подготовки');
    }
  },

  // 🔹 Нанесение урона
  async applyDamage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { damage, damageType } = req.body;

      if (!damage || damage < 0) {
        return res.status(400).json({
          success: false,
          message: 'Некорректное значение урона'
        });
      }

      await checkCharacterOwnership(id, userId);

      const character = await dbHelpers.get(
        'SELECT current_hp, temporary_hp FROM dnd_characters WHERE id = ?',
        [id]
      );

      let { current_hp, temporary_hp } = character;
      let remainingDamage = damage;

      // Сначала поглощаем урон временными HP
      if (temporary_hp > 0) {
        if (temporary_hp >= remainingDamage) {
          temporary_hp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= temporary_hp;
          temporary_hp = 0;
        }
      }

      // Затем наносим урон обычным HP
      current_hp = Math.max(0, current_hp - remainingDamage);

      await dbHelpers.run(
        'UPDATE dnd_characters SET current_hp = ?, temporary_hp = ? WHERE id = ?',
        [current_hp, temporary_hp, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: `Урон применен: ${damage} ${damageType || ''}`,
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'нанесении урона');
    }
  },

  // 🔹 Лечение
  async applyHealing(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { healing } = req.body;

      if (!healing || healing < 0) {
        return res.status(400).json({
          success: false,
          message: 'Некорректное значение лечения'
        });
      }

      await checkCharacterOwnership(id, userId);

      const character = await dbHelpers.get(
        'SELECT current_hp, max_hp FROM dnd_characters WHERE id = ?',
        [id]
      );

      const newHp = Math.min(character.max_hp, character.current_hp + healing);

      await dbHelpers.run(
        'UPDATE dnd_characters SET current_hp = ? WHERE id = ?',
        [newHp, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: `Лечение применено: +${healing} HP`,
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'лечении');
    }
  },

  // 🔹 Короткий отдых
  async shortRest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { hit_dice_used = 0 } = req.body;

      await checkCharacterOwnership(id, userId);

      const character = await dbHelpers.get(
        'SELECT current_hit_dice, current_hp, max_hp FROM dnd_characters WHERE id = ?',
        [id]
      );

      // Восстановление HP через кости хитов
      let healing = 0;
      let newHitDice = character.current_hit_dice;

      if (hit_dice_used > 0 && newHitDice > 0) {
        const diceUsed = Math.min(hit_dice_used, newHitDice);
        // Упрощенный расчет - в реальности нужно бросать кости
        const diceType = parseInt(character.hit_dice.split('d')[1]) || 8;
        healing = diceUsed * Math.ceil(diceType / 2); // Среднее значение кости
        newHitDice -= diceUsed;
      }

      const newHp = Math.min(character.max_hp, character.current_hp + healing);

      await dbHelpers.run(
        'UPDATE dnd_characters SET current_hp = ?, current_hit_dice = ? WHERE id = ?',
        [newHp, newHitDice, id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Короткий отдых завершен',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'коротком отдыхе');
    }
  },

  // 🔹 Длинный отдых
  async longRest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await checkCharacterOwnership(id, userId);

      const character = await dbHelpers.get(
        'SELECT max_hp, hit_dice FROM dnd_characters WHERE id = ?',
        [id]
      );

      // Полное восстановление HP и костей хитов
      const maxHitDice = parseInt(character.hit_dice.split('d')[0]) || 1;
      
      await dbHelpers.run(
        `UPDATE dnd_characters SET 
        current_hp = max_hp, 
        temporary_hp = 0,
        current_hit_dice = ?,
        death_saves_success = 0,
        death_saves_failure = 0,
        condition = 'Нормальное'
        WHERE id = ?`,
        [maxHitDice, id]
      );

      // Восстановление ячеек заклинаний
      await dbHelpers.run(
        'UPDATE character_spell_slots SET used = 0 WHERE character_id = ?',
        [id]
      );

      // Восстановление использований способностей
      await dbHelpers.run(
        'UPDATE character_features SET current_uses = uses_per_day WHERE character_id = ?',
        [id]
      );

      // Получаем обновленного персонажа
      const updatedCharacter = await characterHelpers.getCharacter(id);

      res.json({
        success: true,
        message: 'Длинный отдых завершен',
        data: updatedCharacter
      });
    } catch (error) {
      handleError(res, error, 'длинном отдыхе');
    }
  },

  // 🔹 Получение публичного персонажа
  async getPublicCharacter(req, res) {
    try {
      const { characterId } = req.params;

      const character = await dbHelpers.get(
        'SELECT is_public FROM dnd_characters WHERE id = ?',
        [characterId]
      );

      if (!character || !character.is_public) {
        return res.status(404).json({
          success: false,
          message: 'Публичный персонаж не найден'
        });
      }

      const characterData = await characterHelpers.getCharacter(characterId);
      
      res.json({
        success: true,
        data: characterData
      });
    } catch (error) {
      console.error('Error getting public character:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении публичного персонажа',
        error: error.message
      });
    }
  }
};

// 🔹 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function calculateDefaultHP(level, characterClass, constitution) {
  const conModifier = calculateAbilityModifier(constitution);
  const hitDie = getHitDieByClass(characterClass);
  
  // Первый уровень - максимальное значение кости хитов
  let totalHP = hitDie + conModifier;
  
  // Последующие уровни - среднее значение кости хитов
  for (let i = 2; i <= level; i++) {
    totalHP += Math.floor(hitDie / 2) + 1 + conModifier;
  }
  
  return Math.max(1, totalHP);
}

function getHitDieByClass(characterClass) {
  const hitDice = {
    'barbarian': 12,
    'fighter': 10,
    'paladin': 10,
    'ranger': 10,
    'rogue': 8,
    'bard': 8,
    'cleric': 8,
    'druid': 8,
    'monk': 8,
    'warlock': 8,
    'wizard': 6,
    'sorcerer': 6
  };
  
  const lowerClass = characterClass?.toLowerCase() || 'fighter';
  return hitDice[lowerClass] || 8;
}

function calculateHitDice(level, characterClass) {
  const hitDie = getHitDieByClass(characterClass);
  return `${level}d${hitDie}`;
}

function calculateProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1;
}

function calculateAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}
// Проверка владения персонажем
async function checkCharacterOwnership(characterId, userId) {
  const character = await dbHelpers.get(
    'SELECT user_id FROM dnd_characters WHERE id = ?',
    [characterId]
  );

  if (!character) {
    throw new Error('Персонаж не найден');
  }

  if (character.user_id !== userId) {
    throw new Error('Нет прав для выполнения этого действия');
  }
}

// Обработка ошибок
function handleError(res, error, action) {
  console.error(`Error in ${action}:`, error);
  res.status(500).json({
    success: false,
    message: `Ошибка при ${action}`,
    error: error.message
  });
}