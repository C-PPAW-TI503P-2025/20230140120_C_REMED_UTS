const Book = require('../models/book.model');
const BorrowLog = require('../models/borrowLog.model');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Get all borrow logs with optional userId filter
exports.getAll = async (req, res) => {
    try {
        const { userId } = req.query;
        const where = {};

        if (userId) {
            where.userId = userId;
        }

        const logs = await BorrowLog.findAll({
            where,
            include: [{
                model: Book,
                attributes: ['id', 'title', 'author']
            }],
            order: [['borrowDate', 'DESC']]
        });

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Return a borrowed book
exports.returnBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { borrowId } = req.body;
        const userId = req.headers['x-user-id'];

        if (!userId) {
            await t.rollback();
            return res.status(400).json({ message: 'User ID is missing (x-user-id header required)' });
        }

        if (!borrowId) {
            await t.rollback();
            return res.status(400).json({ message: 'Borrow ID is required' });
        }

        const borrowLog = await BorrowLog.findByPk(borrowId, { transaction: t });

        if (!borrowLog) {
            await t.rollback();
            return res.status(404).json({ message: 'Borrow record not found' });
        }

        if (borrowLog.userId != userId) {
            await t.rollback();
            return res.status(403).json({ message: 'You can only return your own borrowed books' });
        }

        if (borrowLog.returnDate) {
            await t.rollback();
            return res.status(400).json({ message: 'This book has already been returned' });
        }

        // Update return date
        borrowLog.returnDate = new Date();
        await borrowLog.save({ transaction: t });

        // Increase book stock
        const book = await Book.findByPk(borrowLog.bookId, { transaction: t });
        if (book) {
            book.stock += 1;
            await book.save({ transaction: t });
        }

        await t.commit();
        res.json({ message: 'Book returned successfully', log: borrowLog });

    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err.message });
    }
};

exports.borrow = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { bookId, latitude, longitude } = req.body;
        // UserID should come from headers in this simulation
        const userId = req.headers['x-user-id'];

        if (!userId) {
            await t.rollback();
            return res.status(400).json({ message: 'User ID is missing (x-user-id header required)' });
        }

        // Validate bookId
        if (!bookId) {
            await t.rollback();
            return res.status(400).json({ message: 'Book ID is required' });
        }

        // Validate latitude
        if (latitude === undefined || latitude === null) {
            await t.rollback();
            return res.status(400).json({ message: 'Latitude is required' });
        }
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            await t.rollback();
            return res.status(400).json({ message: 'Latitude must be a number between -90 and 90' });
        }

        // Validate longitude
        if (longitude === undefined || longitude === null) {
            await t.rollback();
            return res.status(400).json({ message: 'Longitude is required' });
        }
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
            await t.rollback();
            return res.status(400).json({ message: 'Longitude must be a number between -180 and 180' });
        }

        const book = await Book.findByPk(bookId, { transaction: t });
        if (!book) {
            await t.rollback();
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.stock <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Book is out of stock' });
        }

        // Decrease stock
        book.stock -= 1;
        await book.save({ transaction: t });

        // Log transaction
        const log = await BorrowLog.create({
            userId: userId,
            bookId: bookId,
            latitude: latitude,
            longitude: longitude
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Book borrowed successfully', log: log });

    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err.message });
    }
};
