const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();

// User registration route
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with > 5 characters').isLength({ min: 5 }),
    check('role', 'A valid role is required').isIn([
        'Director',
        'Programme Manager',
        'Coach',
        'Team Manager',
        'Player',
        'Volunteer',
    ])
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
    }

    const { name, email, password, role } = req.body;

    try {
        let { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if(rows.length > 0) {
            return res.status(400).json({message : 'User already exists'});
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const pwd_hash = await bcrypt.hash(password, salt);

        // save new user to db
        const newUserQuery = `
            INSERT INTO users (
                name,
                email,
                pwd_hash,
                role
            ) VALUES ($1, $2, $3, $4)
            RETURNING id, name, role
            `;

        const newUserResult = await db.query(newUserQuery, [name, email, pwd_hash, role]);
        const newUser = newUserResult.rows[0];

        // The registration query returns: id, name, role
        // newUser = { id: <number>, name: <string>, role: <string> }
        
        // create, return jwt
        const payload = {
            user : {
                id : newUser.id,
                role : newUser.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) {
                console.error('JWT sign error:', err);
                return res.status(500).json({ message: 'Token generation error' });
            }
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message : 'Server error '});
    }
});

// @route POST /api/auth/login
// @description Authenticate user & get token
// @access Public
router.post('/login', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors : errors.array()});
        }
    
    const {email, password} = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        let { rows } = await db.query(query, [email]);

        // Check if user exists
        if (rows.length === 0) {
            return res.status(400).json({message : 'User not found'});
        }
        const user = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.pwd_hash);
        if(!isMatch) {
            return res.status(400).json({message : 'Invalid Credential'});
        }

        // user is valid, create and return jwt
        const payload = {
            user : {
                id : user.id,
                role : user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (error, token) => {
            if (error) {
                console.error('JWT sign error:', error);
                return res.status(500).json({ message: 'Token generation error' });
            }
            res.json({ token });
        });
    } catch (error) {
        console.error(`Login error: ${error.message}`);
        res.status(500).send({message : 'Server error', error: error.message});
    }
}
)

module.exports = router;