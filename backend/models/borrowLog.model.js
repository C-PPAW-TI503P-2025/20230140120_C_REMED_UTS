const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./book.model');

const BorrowLog = sequelize.define('BorrowLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    borrowDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Optional: Define association
BorrowLog.belongsTo(Book, { foreignKey: 'bookId', onDelete: 'CASCADE' });

module.exports = BorrowLog;
