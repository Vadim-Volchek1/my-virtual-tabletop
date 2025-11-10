import express from 'express';
import { characterController } from '../controllers/characterController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

console.log('🧩 [ROUTES] characterRoutes файл загружен');

const router = express.Router();

/* ============================================================
   🔹 ПУБЛИЧНЫЕ РОУТЫ (без авторизации)
   ============================================================ */
router.get('/public/:characterId', (req, res, next) => {
  console.log('🌍 [ROUTE] GET /api/characters/public/:characterId');
  next();
}, characterController.getPublicCharacter);

/* ============================================================
   🔹 ВСЁ ДАЛЕЕ ТРЕБУЕТ ТОКЕН
   ============================================================ */
router.use((req, res, next) => {
  console.log('🛡 [ROUTE] Проходим через authMiddleware для', req.method, req.originalUrl);
  next();
}, authMiddleware);

/* ============================================================
   🔹 ОБЩИЙ ЛОГЕР ДЛЯ ВСЕХ ЗАПРОСОВ ПОСЛЕ authMiddleware
   ============================================================ */
router.use((req, res, next) => {
  console.log(`📡 [ROUTE] ${req.method} ${req.originalUrl} — в characterRoutes`);
  next();
});

/* ============================================================
   🔹 БАЗОВЫЕ CRUD
   ============================================================ */

router.get('/my', (req, res, next) => {
    console.log('🚀 [ROUTE] GET /api/characters/my — вызван');
    next();
}, characterController.getUserCharacters);

router.post('/', (req, res, next) => {
  console.log('🚀 [ROUTE] POST /api/characters — создание персонажа');
  next();
}, characterController.createCharacter);

router.get('/:id', (req, res, next) => {
  console.log(`🚀 [ROUTE] GET /api/characters/${req.params.id} — получение персонажа`);
  next();
}, characterController.getCharacter);

router.put('/:id', (req, res, next) => {
  console.log(`🚀 [ROUTE] PUT /api/characters/${req.params.id} — обновление персонажа`);
  next();
}, characterController.updateCharacter);

router.delete('/:id', (req, res, next) => {
  console.log(`🚀 [ROUTE] DELETE /api/characters/${req.params.id} — удаление персонажа`);
  next();
}, characterController.deleteCharacter);

/* ============================================================
   🔹 ДОПОЛНИТЕЛЬНЫЕ ЭНДПОИНТЫ
   ============================================================ */
router.post('/:id/items', characterController.addItem);
router.put('/:id/items/:itemId', characterController.updateItem);
router.delete('/:id/items/:itemId', characterController.removeItem);
router.post('/:id/inventory/equip', characterController.equipItem);
router.post('/:id/inventory/unequip', characterController.unequipItem);
router.post('/:id/weapons', characterController.addWeapon);
router.post('/:id/spells', characterController.addSpell);
router.post('/:id/spells/prepare', characterController.prepareSpell);
router.post('/:id/spells/unprepare', characterController.unprepareSpell);
router.post('/:id/features', characterController.addFeature);
router.post('/:id/combat/damage', characterController.applyDamage);
router.post('/:id/combat/heal', characterController.applyHealing);
router.post('/:id/rest/short', characterController.shortRest);
router.post('/:id/rest/long', characterController.longRest);

/* ============================================================
   🔹 ФИНАЛЬНЫЙ ЭКСПОРТ
   ============================================================ */
export default router;
