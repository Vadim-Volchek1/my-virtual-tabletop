import express from 'express';
import configController from '../controllers/configController.js';

const router = express.Router();

// 🔹 GET маршруты - для получения конфигураций

// Получить ВСЕ конфигурации сразу
router.get('/', configController.getAllConfigs);

// Получить статистику по конфигурациям
router.get('/stats', configController.getStats);

// Получить конкретную конфигурацию
router.get('/:configName', configController.getConfig);

// 🔹 POST маршруты - для добавления нового контента

// Добавить новую расу
router.post('/races', configController.addRace);

// Добавить новый класс
router.post('/classes', configController.addClass);

// Добавить новое заклинание
router.post('/spells', configController.addSpell);

// Добавить новый предмет
router.post('/items', configController.addItem);

// 🔹 PUT маршруты - для обновления существующего контента

// Обновить элемент в конфигурации
router.put('/:configName', configController.updateConfig);

export default router;