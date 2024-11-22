const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Serve frontend first
app.use(express.static(path.join(__dirname, '../frontend')));

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Placeholder routes
app.get('/api', (req, res) => {
    res.send('Welcome to the Online Store API!');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
