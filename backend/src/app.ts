import cors from 'cors';
import express from 'express';
import authRoutes from './api/auth/auth.route.js';
import boardsRoutes from './api/boards/boards.route.js';
import cardRoutes from './api/cards/card.route.js';
import columnRoutes from './api/columns/columns.route.js';
import memberRoutes from './api/members/members.route.js';
import chatRoutes from './api/chat/chat.route.js';
import inviteRoutes from './api/invites/invite.route.js';
import notificationRoutes from './api/notifications/notification.route.js';
import { corsConfig } from './config/env.js';
import {
  authLimiter,
  compressionConfig,
  generalLimiter,
  helmetConfig,
  hppConfig,
  mongoSanitizeConfig,
  requestId,
  securityHeaders,
  securityLogger,
} from './middlewares/security.js';

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middlewares (order matters!)
app.use(helmetConfig);
app.use(securityHeaders);
app.use(compressionConfig);
app.use(requestId);
app.use(securityLogger);

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middlewares
app.use(mongoSanitizeConfig);
app.use(hppConfig);

// CORS configuration
app.use(cors(corsConfig));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/boards', memberRoutes);
app.use('/api/boards', chatRoutes);
app.use('/api', inviteRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
