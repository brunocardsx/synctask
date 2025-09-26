import express from 'express';
import authRoutes from './api/auth/auth.route.js';
import boardsRoutes from './api/boards/boards.route.js';
import cardRoutes from './api/cards/card.route.js';
import memberRoutes from './api/members/members.route.js';
import cors from 'cors';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', memberRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
