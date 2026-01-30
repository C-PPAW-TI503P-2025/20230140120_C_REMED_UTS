const express = require('express');
const router = express.Router();
const books = require('../controllers/book.controller');
const { authSimulation, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.get('/', books.findAll);
router.get('/:id', books.findOne);

// Admin only routes
router.post('/', authSimulation, restrictTo(['admin']), books.create);
router.put('/:id', authSimulation, restrictTo(['admin']), books.update);
router.delete('/:id', authSimulation, restrictTo(['admin']), books.delete);

module.exports = router;
