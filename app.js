// ====== CORE IMPORTS ======
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const { port, sessionSecret } = require('./config/config');

// DB pool (mysql2/promise) from /db/index.js
const db = require('./db/index');

// ====== ROUTES ======
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const canvasRoutes = require('./routes/canvasRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const artworkEditRoutes = require('./routes/artworkRoutes');


// ====== MODELS ======
const canvasModel = require('./models/canvasModel');

// ====== APP + HTTP + SOCKET.IO ======
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// ====== VIEW ENGINE ======
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ====== MIDDLEWARE ======
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (simple express-session)
app.use(
  session({
    secret: sessionSecret || 'cyrus_fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 4 // 4 hours
    }
  })
);

// Flash messages
app.use(flash());

// Make session + flash data available in all views
app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUsername = req.session.username || null;
  res.locals.currentDisplayName = req.session.displayName || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
// ====== ROUTES ======

// Main app routes
app.use(indexRoutes);
app.use(authRoutes);
app.use(galleryRoutes);
app.use(canvasRoutes);
app.use(profileRoutes);
app.use(adminRoutes);
app.use(workspaceRoutes);
app.use(artworkEditRoutes);

// Simple DB test route (for debugging DB connection)
app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.send('DB OK: ' + rows[0].result);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB ERROR: ' + err.message);
  }
});

// Debug login page you used earlier
app.get('/debug-login', (req, res) => {
  res.render('debug-login');
});

// 404 fallback (keep AFTER all other routes)
app.use((req, res) => {
  res.status(404).render('index', { title: 'Not found - CYRUS' });
});

// ====== REAL-TIME LAYER (Socket.IO) ======
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User joins a specific canvas room
  socket.on('join_canvas', async ({ canvasId }) => {
    const roomName = `canvas_${canvasId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const currentCount = room ? room.size : 0;
    console.log('JOIN request', socket.id, canvasId);


    // Max 5 concurrent collaborators
    if (currentCount >= 5) {
      socket.emit('canvas_full');
      return;
    }

    socket.join(roomName);
    console.log(`Socket ${socket.id} joined ${roomName} (${currentCount + 1} users)`);

    // Load persisted state from DB
    const state = await canvasModel.getState(canvasId);
    socket.emit('init_canvas', state);
  });

  // Apply batch of operations to a canvas
  socket.on('canvas_update', async ({ canvasId, ops }) => {
    let state = await canvasModel.getState(canvasId);

    ops.forEach((op) => {
      if (op.type === 'pixel') {
        state.push({
          type: 'pixel',
          x: op.x,
          y: op.y,
          color: op.color
        });
      }
      // (extension point: move / delete / text / objects)
    });

    await canvasModel.saveState(canvasId, state);

    const roomName = `canvas_${canvasId}`;
    socket.to(roomName).emit('canvas_update', { ops });
  });

  socket.on('clear_canvas', async ({ canvasId }) => {
    await canvasModel.clearCanvas(canvasId);
    const roomName = `canvas_${canvasId}`;
    io.to(roomName).emit('clear_canvas');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ====== START SERVER ======
http.listen(port, () => {
  console.log(`CYRUS running at http://localhost:${port}`);
});

module.exports = { app, http, io };
