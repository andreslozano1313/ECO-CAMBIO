const dotenv = require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 1. ruta para autenticacion
app.use('/api/auth', require('./routes/authRoutes'));
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));