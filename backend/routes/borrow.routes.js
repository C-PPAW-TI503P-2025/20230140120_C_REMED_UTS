const express = require('express');
const router = express.Router();
const borrow = require('../controllers/borrow.controller');
const { authSimulation, restrictTo } = require('../middleware/auth.middleware');

// Get borrow history (public, optional filter by userId)
router.get('/', borrow.getAll);

// User only routes
router.post('/', authSimulation, restrictTo(['user']), borrow.borrow);

// Return book
router.post('/return', authSimulation, restrictTo(['user']), borrow.returnBook);

module.exports = router;
