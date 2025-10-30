const express = require('express');
const db = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// app routes
app.use('/api/auth', require('./routes/auth'));

// Test database connection
app.get('/api/db-test', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT NOW()');
        res.status(200).json({
            message : 'Database connection successful',
            time : rows[0].now
        });
        console.log('Database query successful');
    } catch ( err ) {
        console.error('Database query failed', err);
        res.status(500).json({
            message : 'Database connection failed!',
        });
    }
});

app.get('/', (req, res) => {
    res.send('Hello from the backend server!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

