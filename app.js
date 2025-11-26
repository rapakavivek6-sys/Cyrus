const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- View engine: PUG ----
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'app', 'views'));

// ---- Static files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Fake "database" data ----
const artworks = [
  { id: 1, title: 'Sunset Grid', author: 'Abigail', pixels: 1200 },
  { id: 2, title: 'Retro City', author: 'Jordan', pixels: 800 },
  { id: 3, title: 'Neon Lines', author: 'Guest User', pixels: 450 }
];

// ---- Routes ----

// Home route – list artworks
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Cyrus – Home',
    artworks
  });
});

// Gallery route – same data, different view
app.get('/gallery', (req, res) => {
  res.render('gallery', {
    title: 'Cyrus – Gallery',
    artworks
  });
});

// Login route – just a form for now
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Cyrus – Login'
  });
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
