import express from 'express';
import authRoutes from "./api/auth/auth.route";
import boardsRoutes from "./api/boards/boards.route";

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardsRoutes);

export default app;