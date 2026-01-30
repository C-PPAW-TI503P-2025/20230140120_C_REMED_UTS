const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const bookRoutes = require('./routes/book.routes');
const borrowRoutes = require('./routes/borrow.routes');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-user-role', 'x-user-id']
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// Database sync and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
