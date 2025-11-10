import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { characterAPI } from '../services/characterAPI';

const CharacterContext = createContext();

// Типы действий
export const CHARACTER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CHARACTERS: 'SET_CHARACTERS',
  SET_CURRENT_CHARACTER: 'SET_CURRENT_CHARACTER',
  ADD_CHARACTER: 'ADD_CHARACTER',
  UPDATE_CHARACTER: 'UPDATE_CHARACTER',
  DELETE_CHARACTER: 'DELETE_CHARACTER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Начальное состояние
const initialState = {
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null
};

// Редуктор
const characterReducer = (state, action) => {
  switch (action.type) {
    case CHARACTER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case CHARACTER_ACTIONS.SET_CHARACTERS:
      return {
        ...state,
        characters: action.payload,
        loading: false
      };

    case CHARACTER_ACTIONS.SET_CURRENT_CHARACTER:
      return {
        ...state,
        currentCharacter: action.payload,
        loading: false
      };

    case CHARACTER_ACTIONS.ADD_CHARACTER:
      return {
        ...state,
        characters: [action.payload, ...state.characters]
      };

    case CHARACTER_ACTIONS.UPDATE_CHARACTER:
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id ? action.payload : char
        ),
        currentCharacter: state.currentCharacter?.id === action.payload.id ? action.payload : state.currentCharacter
      };

    case CHARACTER_ACTIONS.DELETE_CHARACTER:
      return {
        ...state,
        characters: state.characters.filter(char => char.id !== action.payload),
        currentCharacter: state.currentCharacter?.id === action.payload ? null : state.currentCharacter
      };

    case CHARACTER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case CHARACTER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Вспомогательная функция для извлечения данных персонажа
const extractCharacterData = (character) => {
  if (!character) return null;
  
  console.log('🔍 Extracting character data:', character);
  
  // Если персонаж приходит из списка (упрощенная структура)
  if (character.basic_info) {
    return {
      id: character.basic_info.id,
      name: character.basic_info.name,
      race: character.basic_info.race,
      class: character.basic_info.class,
      level: character.basic_info.level,
      background: character.basic_info.background,
      alignment: character.basic_info.alignment,
      experience: character.basic_info.experience,
      subrace: character.basic_info.subrace,
      subclass: character.basic_info.subclass,
      
      // Боевые параметры с значениями по умолчанию
      armor_class: character.combat?.armor_class || 10,
      current_hp: character.combat?.hit_points?.current || 10,
      max_hp: character.combat?.hit_points?.max || 10,
      temporary_hp: character.combat?.hit_points?.temporary || 0,
      speed: character.combat?.speed || 30,
      initiative: character.combat?.initiative || 0,
      proficiency_bonus: character.combat?.proficiency_bonus || 2,
      passive_perception: character.combat?.passive_perception || 10,
      condition: character.combat?.condition || 'Нормальное',
      hit_dice: character.combat?.hit_dice || '1d8',
      current_hit_dice: character.combat?.current_hit_dice || 1,
      
      // Характеристики с значениями по умолчанию
      abilities: character.abilities || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      
      skills: character.skills || [],
      economy: character.economy || {},
      inventory: character.inventory || [],
      weapons: character.weapons || [],
      spells: character.magic?.spells || [],
      spell_slots: character.magic?.spell_slots || [],
      features: character.features || [],
      proficiencies: character.proficiencies || [],
      
      // Описание
      portrait_url: character.description?.portrait_url,
      appearance: character.description?.appearance,
      personality_traits: character.description?.personality_traits,
      ideals: character.description?.ideals,
      bonds: character.description?.bonds,
      flaws: character.description?.flaws,
      backstory: character.description?.backstory,
      notes: character.description?.notes,
      
      // Мета-данные
      is_public: character.meta?.is_public,
      user_id: character.meta?.user_id,
      created_at: character.meta?.created_at,
      updated_at: character.meta?.updated_at
    };
  }
  
  // Если персонаж приходит как простой объект (из списка)
  return {
    ...character,
    abilities: character.abilities || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    armor_class: character.armor_class || 10,
    current_hp: character.current_hp || 10,
    max_hp: character.max_hp || 10,
    speed: character.speed || 30,
    initiative: character.initiative || 0
  };
};

// Провайдер контекста
export const CharacterProvider = ({ children, currentUser }) => {
  console.log('🧩 [CharacterProvider] Монтируется провайдер');
  console.log('👤 [CharacterProvider] currentUser:', currentUser);

  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Действия
  const actions = {
    // Загрузка персонажей пользователя
    loadUserCharacters: async () => {
      try {
        dispatch({ type: CHARACTER_ACTIONS.SET_LOADING, payload: true });
        const response = await characterAPI.getUserCharacters();
        
        if (response.success && response.data) {
          const characters = response.data.map(extractCharacterData);
          dispatch({ type: CHARACTER_ACTIONS.SET_CHARACTERS, payload: characters });
        } else {
          throw new Error(response.message || 'Не удалось загрузить персонажей');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка загрузки персонажей';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
      }
    },

    // Создание персонажа
    createCharacter: async (characterData) => {
      try {
        dispatch({ type: CHARACTER_ACTIONS.SET_LOADING, payload: true });
        const response = await characterAPI.createCharacter(characterData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.ADD_CHARACTER, payload: character });
          dispatch({ type: CHARACTER_ACTIONS.SET_CURRENT_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось создать персонажа');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка создания персонажа';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Загрузка конкретного персонажа
    loadCharacter: async (characterId) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        dispatch({ type: CHARACTER_ACTIONS.SET_LOADING, payload: true });
        const response = await characterAPI.getCharacter(characterId);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.SET_CURRENT_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Персонаж не найден');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка загрузки персонажа';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Обновление характеристик
    updateAbilities: async (characterId, abilities) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.updateAbilities(characterId, abilities);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось обновить характеристики');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка обновления характеристик';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Обновление персонажа
    updateCharacter: async (characterId, updateData) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.updateCharacter(characterId, updateData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось обновить персонажа');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка обновления персонажа';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Добавление заклинания
    addSpell: async (characterId, spellData) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.addSpell(characterId, spellData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось добавить заклинание');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка добавления заклинания';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Добавление предмета
    addItem: async (characterId, itemData) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.addItem(characterId, itemData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось добавить предмет');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка добавления предмета';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Обновление предмета
    updateItem: async (characterId, itemId, updateData) => {
      try {
        if (!characterId || !itemId) {
          throw new Error('ID персонажа или предмета не указан');
        }

        const response = await characterAPI.updateItem(characterId, itemId, updateData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось обновить предмет');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка обновления предмета';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Удаление предмета
    removeItem: async (characterId, itemId) => {
      try {
        if (!characterId || !itemId) {
          throw new Error('ID персонажа или предмета не указан');
        }

        const response = await characterAPI.removeItem(characterId, itemId);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось удалить предмет');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка удаления предмета';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Удаление персонажа
    deleteCharacter: async (characterId) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.deleteCharacter(characterId);
        
        if (response.success) {
          dispatch({ type: CHARACTER_ACTIONS.DELETE_CHARACTER, payload: characterId });
        } else {
          throw new Error(response.message || 'Не удалось удалить персонажа');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка удаления персонажа';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Нанесение урона
    applyDamage: async (characterId, damageData) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.applyDamage(characterId, damageData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось применить урон');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка нанесения урона';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Лечение
    applyHealing: async (characterId, healingData) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.applyHealing(characterId, healingData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось применить лечение');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка лечения';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Отдых
    shortRest: async (characterId, restData = {}) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.shortRest(characterId, restData);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось завершить короткий отдых');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка короткого отдыха';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    longRest: async (characterId) => {
      try {
        if (!characterId) {
          throw new Error('ID персонажа не указан');
        }

        const response = await characterAPI.longRest(characterId);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось завершить длинный отдых');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка длинного отдыха';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Экипировка предмета
    equipItem: async (characterId, itemId) => {
      try {
        if (!characterId || !itemId) {
          throw new Error('ID персонажа или предмета не указан');
        }

        const response = await characterAPI.equipItem(characterId, itemId);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось экипировать предмет');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка экипировки предмета';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Снятие предмета
    unequipItem: async (characterId, itemId) => {
      try {
        if (!characterId || !itemId) {
          throw new Error('ID персонажа или предмета не указан');
        }

        const response = await characterAPI.unequipItem(characterId, itemId);
        
        if (response.success && response.data) {
          const character = extractCharacterData(response.data);
          dispatch({ type: CHARACTER_ACTIONS.UPDATE_CHARACTER, payload: character });
          return character;
        } else {
          throw new Error(response.message || 'Не удалось снять предмет');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Ошибка снятия предмета';
        dispatch({ 
          type: CHARACTER_ACTIONS.SET_ERROR, 
          payload: errorMessage 
        });
        throw error;
      }
    },

    // Очистка ошибки
    clearError: () => {
      dispatch({ type: CHARACTER_ACTIONS.CLEAR_ERROR });
    },

    // Очистка текущего персонажа
    clearCurrentCharacter: () => {
      dispatch({ type: CHARACTER_ACTIONS.SET_CURRENT_CHARACTER, payload: null });
    }
  };

  // Автоматическая загрузка персонажей при изменении пользователя
  useEffect(() => {
    if (currentUser?.id) {
      actions.loadUserCharacters();
    }
  }, [currentUser?.id]);

  const value = {
    ...state,
    ...actions
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Хук для использования контекста
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};