require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/authRoutes');

const app = express();

/*const corsOptions = {
    origin: [
        "https://your-github-pages-url.com", // Your frontend URL
        "http://localhost:3000"              // For local testing
    ],
    credentials: true
};*/
const corsOptions = {
    origin: [
        "https://host-codes.github.io",          // Root domain
        "https://host-codes.github.io/quiz_wiz", // With repo path
        "http://localhost:3000"                  // For local development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],   // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Email transporter
/*const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}); */

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//module.exports = { transporter };
