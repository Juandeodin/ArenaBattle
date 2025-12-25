import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { ServerToClientEvents, ClientToServerEvents } from './types';
import { GameManager } from './socket';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const httpServer = createServer(app);

// Configurar CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Configurar Socket.io
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }
});

// Inicializar GameManager
const gameManager = new GameManager(io);

// Manejar conexiones de Socket
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  gameManager.setupSocketHandlers(socket);
});

// Servir archivos estáticos del cliente en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ⚔️  ARENA BATTLE - Servidor de Gladiadores  ⚔️           ║
║                                                            ║
║   🏛️  Servidor corriendo en puerto ${PORT}                   ║
║   🤖  Proveedor IA: ${process.env.AI_PROVIDER || 'gemini'}                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
