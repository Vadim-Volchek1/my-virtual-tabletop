import { characterHelpers, jsonHelpers, dbHelpers } from '../config/database.js';

export class CharacterService {
  // Создание персонажа с использованием JSON конфигов
  static async createCharacter(userId, characterData) {
    // Проверяем существование расы и класса в JSON конфигах
    const races = await jsonHelpers.readConfig('races');
    const classes = await jsonHelpers.readConfig('classes');

    if (!races[characterData.race]) {
      throw new Error(`Раса "${characterData.race}" не найдена`);
    }

    if (!classes[characterData.class]) {
      throw new Error(`Класс "${characterData.class}" не найдена`);
    }

    return await characterHelpers.createCharacter({
      user_id: userId,
      ...characterData
    });
  }

  // Получение полной информации о персонаже с JSON данными
  static async getCharacterFull(characterId) {
    const character = await characterHelpers.getCharacter(characterId);
    if (!character) return null;

    // Добавляем JSON данные о расе и классе
    const races = await jsonHelpers.readConfig('races');
    const classes = await jsonHelpers.readConfig('classes');
    const spells = await jsonHelpers.readConfig('spells');
    const items = await jsonHelpers.readConfig('items');

    character.race_data = races[character.race];
    character.class_data = classes[character.class];

    // Обогащаем заклинания данными из JSON
    character.spells = character.spells.map(spell => ({
      ...spell,
      spell_data: spells[spell.spell_name] || {}
    }));

    // Обогащаем инвентарь данными из JSON
    character.inventory = character.inventory.map(item => ({
      ...item,
      item_data: items[item.item_name] || {}
    }));

    // Рассчитываем модификаторы
    character.ability_modifiers = this.calculateAllModifiers(character.abilities);
    character.armor_class = this.calculateArmorClass(character);

    return character;
  }

  // Получение всех доступных рас и классов
  static async getAvailableOptions() {
    const [races, classes, skills, spells, items] = await Promise.all([
      jsonHelpers.readConfig('races'),
      jsonHelpers.readConfig('classes'),
      jsonHelpers.readConfig('skills'),
      jsonHelpers.readConfig('spells'),
      jsonHelpers.readConfig('items')
    ]);

    return { races, classes, skills, spells, items };
  }

  // Расчет модификаторов характеристик
  static calculateAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
  }

  // Расчет всех модификаторов
  static calculateAllModifiers(abilities) {
    const modifiers = {};
    for (const [ability, score] of Object.entries(abilities)) {
      if (ability !== 'id' && ability !== 'character_id') {
        modifiers[ability] = this.calculateAbilityModifier(score);
      }
    }
    return modifiers;
  }

  // Расчет класса брони
  static calculateArmorClass(character) {
    const dexModifier = this.calculateAbilityModifier(character.abilities.dexterity);
    let baseAC = 10 + dexModifier;

    // Проверяем броню в инвентаре
    const armor = character.inventory.find(item => 
      item.equipped && item.item_data?.type === 'armor'
    );

    if (armor) {
      baseAC = armor.item_data.armor_class + (armor.item_data.type === 'light' ? dexModifier : 0);
    }

    return baseAC;
  }
}