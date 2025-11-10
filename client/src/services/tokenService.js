import { sessionsAPI } from './api/index';

export const tokenAPI = {
  getTokens: (sessionId) => sessionsAPI.get(`/${sessionId}/tokens`),
  createToken: (sessionId, tokenData) => 
    sessionsAPI.post(`/${sessionId}/tokens`, tokenData),
  updateToken: (sessionId, tokenId, updates) => 
    sessionsAPI.put(`/${sessionId}/tokens/${tokenId}`, updates),
  deleteToken: (sessionId, tokenId) => 
    sessionsAPI.delete(`/${sessionId}/tokens/${tokenId}`),
};