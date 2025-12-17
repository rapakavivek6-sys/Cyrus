const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const { port, sessionSecret } = require('./config/config');

const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const canvasRoutes = require('./routes/canvasRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

const canvasModel = require('./models/canvasModel');

const app = express();

/* HTTP server + Socket.IO */
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// ====== View engine ======
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ====== Middleware ======
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());

// Make session data/string messages visible in views
app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ====== Routes ======
app.use(indexRoutes);
app.use(authRoutes);
app.use(galleryRoutes);
app.use(canvasRoutes);
app.use(profileRoutes);
app.use(adminRoutes);
app.use(workspaceRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).render('index', { title: 'Not found - CYRUS' });
});

// ====== REAL-TIME LAYER ======
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User joins a specific canvas room
  socket.on('join_canvas', async ({ canvasId }) => {
    const roomName = `canvas_${canvasId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const currentCount = room ? room.size : 0;

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

// Start server
http.listen(port, () => {
  console.log(`CYRUS running at http://localhost:${port}`);
});
