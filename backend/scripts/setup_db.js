const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    };

    console.log(`Attemping to connect to MySQL at ${config.host}:${config.port} with user '${config.user}'...`);

    try {
        const connection = await mysql.createConnection(config);

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);
        await connection.end();
    } catch (error) {
        console.error('------------------------------------------------');
        console.error('CONNECTION ERROR:');
        console.error(`Could not connect to MySQL server at ${config.host}:${config.port}`);
        console.error('Error details:', error.code);
        console.error('------------------------------------------------');
        console.error('POSSIBLE CAUSES:');
        console.error('1. MySQL Server is NOT running.');
        console.error(`2. MySQL is running on a different port (not ${config.port}).`);
        console.error('3. Username or Password in .env is incorrect.');
        process.exit(1);
    }
}

createDatabase();
