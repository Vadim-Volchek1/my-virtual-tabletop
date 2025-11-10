import api from './api/index';

export const configAPI = {
  getConfigs: () => 
    api.get('/configs').then(res => res.data),

  getConfig: (configName) => 
    api.get(`/configs/${configName}`).then(res => res.data),

  getRaces: () => 
    api.get('/configs/races').then(res => res.data),

  getClasses: () => 
    api.get('/configs/classes').then(res => res.data),

  getSkills: () => 
    api.get('/configs/skills').then(res => res.data),

  getSpells: () => 
    api.get('/configs/spells').then(res => res.data),

  getItems: () => 
    api.get('/configs/items').then(res => res.data),
};