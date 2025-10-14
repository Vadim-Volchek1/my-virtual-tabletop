const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
import express from 'express';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth.protect, authController.getMe);

export default router;