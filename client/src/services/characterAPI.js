import api from './api/index';

export const characterAPI = {
  // 🔹 Основные CRUD операции с персонажами
  createCharacter: (characterData) => {
    console.log('Creating character with data:', characterData);
    return api.post('/characters', characterData).then(res => res.data);
  },

  getUserCharacters: () => {
    console.log('📡 [FRONT] Вызван запрос GET /characters/my');
    return api.get('/characters/my')
      .then(res => {
        console.log('✅ [FRONT] Ответ от сервера:', res.data);
        return res.data;
      })
      .catch(err => {
        console.error('💥 [FRONT] Ошибка при запросе /characters/my:', err);
        throw err;
      });
  },

  getCharacter: (characterId) => 
    api.get(`/characters/${characterId}`).then(res => res.data),

  updateCharacter: (characterId, updateData) => 
    api.put(`/characters/${characterId}`, updateData).then(res => res.data),

  deleteCharacter: (characterId) => 
    api.delete(`/characters/${characterId}`).then(res => res.data),

  // 🔹 Операции с инвентарем
  addItem: (characterId, itemData) => 
    api.post(`/characters/${characterId}/items`, itemData).then(res => res.data),

  updateItem: (characterId, itemId, updateData) => 
    api.put(`/characters/${characterId}/items/${itemId}`, updateData).then(res => res.data),

  removeItem: (characterId, itemId) => 
    api.delete(`/characters/${characterId}/items/${itemId}`).then(res => res.data),

  // 🔹 Операции с оружием
  addWeapon: (characterId, weaponData) => 
    api.post(`/characters/${characterId}/weapons`, weaponData).then(res => res.data),

  // 🔹 Операции с заклинаниями
  addSpell: (characterId, spellData) => 
    api.post(`/characters/${characterId}/spells`, spellData).then(res => res.data),

  // 🔹 Операции с чертами и особенностями
  addFeature: (characterId, featureData) => 
    api.post(`/characters/${characterId}/features`, featureData).then(res => res.data),

  // 🔹 Боевые операции
  applyDamage: (characterId, damageData) => 
    api.post(`/characters/${characterId}/combat/damage`, damageData).then(res => res.data),

  applyHealing: (characterId, healingData) => 
    api.post(`/characters/${characterId}/combat/heal`, healingData).then(res => res.data),

  // 🔹 Отдых и восстановление
  shortRest: (characterId, restData = {}) => 
    api.post(`/characters/${characterId}/rest/short`, restData).then(res => res.data),

  longRest: (characterId) => 
    api.post(`/characters/${characterId}/rest/long`).then(res => res.data),

  // 🔹 Экипировка
  equipItem: (characterId, itemId) => 
    api.post(`/characters/${characterId}/inventory/equip`, { itemId }).then(res => res.data),

  unequipItem: (characterId, itemId) => 
    api.post(`/characters/${characterId}/inventory/unequip`, { itemId }).then(res => res.data),

  // 🔹 Заклинания
  prepareSpell: (characterId, spellId) => 
    api.post(`/characters/${characterId}/spells/prepare`, { spellId }).then(res => res.data),

  unprepareSpell: (characterId, spellId) => 
    api.post(`/characters/${characterId}/spells/unprepare`, { spellId }).then(res => res.data),

  // 🔹 Публичные персонажи
  getPublicCharacter: (characterId) => 
    api.get(`/characters/public/${characterId}`).then(res => res.data),

  // 🔹 Обновление характеристик
  updateAbilities: (characterId, abilities) => 
    api.put(`/characters/${characterId}`, { 
      abilities 
    }).then(res => res.data)
};