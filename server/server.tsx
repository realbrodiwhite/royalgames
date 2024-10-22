// At the top of the file, replace the environment type declaration with:

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import next from 'next';
import { config } from 'dotenv';

// Load environment variables
config();

// Define types for environment - fixed declaration
declare namespace NodeJS {
  interface ProcessEnv extends Dict<string> {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT?: string;
  }
  interface Dict<T> {
    [key: string]: T | undefined;
  }
}

// Define game-related types
interface Player {
  id: string;
  username: string;
  roomId?: string;
}

interface GameRoom {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
}

// Game state management
const rooms = new Map<string, GameRoom>();
const players = new Map<string, Player>();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize server and Socket.IO with proper scope
const server = express();
const httpServer = createServer(server);
const io = new Server(httpServer, {
  cors: {
    origin: dev ? "http://localhost:3000" : "*",
    methods: ["GET", "POST"]
  }
});

// Middleware to handle rate limiting
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS = 10;

const handleRateLimit = (socket: Socket): boolean => {
  const now = Date.now();
  const userRequests = rateLimiter.get(socket.id) || 0;
  
  if (userRequests > MAX_REQUESTS) {
    socket.emit('error', { message: 'Rate limit exceeded' });
    return false;
  }
  
  rateLimiter.set(socket.id, userRequests + 1);
  setTimeout(() => rateLimiter.set(socket.id, 0), RATE_LIMIT_WINDOW);
  return true;
};

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  console.log('New client connected', socket.id);

  // Player registration
  socket.on('register_player', ({ username }: { username: string }) => {
    if (!handleRateLimit(socket)) return;

    const player: Player = {
      id: socket.id,
      username
    };
    players.set(socket.id, player);
    socket.emit('registration_success', player);
  });

  // Create game room
  socket.on('create_room', () => {
    if (!handleRateLimit(socket)) return;

    const player = players.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not registered' });
      return;
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room: GameRoom = {
      id: roomId,
      players: [player],
      status: 'waiting'
    };

    rooms.set(roomId, room);
    player.roomId = roomId;
    socket.join(roomId);
    socket.emit('room_created', room);
  });

  // Join room
  socket.on('join_room', ({ roomId }: { roomId: string }) => {
    if (!handleRateLimit(socket)) return;

    const player = players.get(socket.id);
    const room = rooms.get(roomId);

    if (!player || !room) {
      socket.emit('error', { message: 'Invalid player or room' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    room.players.push(player);
    player.roomId = roomId;
    socket.join(roomId);
    io.to(roomId).emit('player_joined', { room, player });

    if (room.players.length >= 2) {
      room.status = 'playing';
      io.to(roomId).emit('game_start', room);
    }
  });

  // Handle game moves
  socket.on('game_move', ({ roomId, move }: { roomId: string; move: any }) => {
    if (!handleRateLimit(socket)) return;

    const room = rooms.get(roomId);
    const player = players.get(socket.id);

    if (!room || !player || room.status !== 'playing') {
      socket.emit('error', { message: 'Invalid game state' });
      return;
    }

    // Broadcast the move to all players in the room
    io.to(roomId).emit('move_made', { player, move });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(room.id);
        } else {
          io.to(room.id).emit('player_left', { player, room });
        }
      }
    }
    players.delete(socket.id);
    console.log('Client disconnected', socket.id);
  });
});

// Next.js request handling
server.all('*', (req: Request, res: Response) => {
  return handle(req, res);
});

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  }).on('error', (err: Error) => {
    console.error('Server error:', err);
    process.exit(1);
  });
});

// Error handling for app preparation
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});