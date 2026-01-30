const Book = require('../models/book.model');
const { Op } = require('sequelize');

exports.findAll = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } }
            ];
        }

        const books = await Book.findAll({ where });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        if (!req.body.title || !req.body.author) {
            return res.status(400).json({ message: 'Title and content can not be empty!' });
        }
        const book = await Book.create(req.body);
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Book.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedBook = await Book.findByPk(id);
            res.json({ message: 'Book updated successfully.', book: updatedBook });
        } else {
            res.status(404).json({ message: `Cannot update Book with id=${id}. Maybe Book was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Book.destroy({ where: { id: id } });
        if (deleted) {
            res.json({ message: 'Book was deleted successfully!' });
        } else {
            res.status(404).json({ message: `Cannot delete Book with id=${id}. Maybe Book was not found!` });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
