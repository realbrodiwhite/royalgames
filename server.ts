// server.ts

import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import sqlite3 from 'sqlite3';
import md5 from 'md5';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';
import { rockClimberData } from './src/data/games/rock-climber/';
import { egyptianTreasuresData } from './src/data/games/egyptian-treasures/contr';

// Interfaces
interface User {
  id: number;
  username: string;
  balance: number;
  key: string;
  last_login?: number;
}

interface GameState {
  user_id: number;
  game_id: string;
  reels: string;
  bet: number;
  coin_value: number;
}

interface LoginData {
  key: string | null;
}

interface BetData {
  key: string;
  gameId: string;
  bet: number;
  coinValue: number;
}

interface WinLine {
  number: number;
  symbol: number;
  count: number;
  map: number[][];
  amount: number;
}

interface BetResult {
  position: number[][];
  lines: WinLine[];
}

interface GameData {
  reelsCount: number;
  reelPositions: number;
  symbolsCount: number;
  linesPositions: number[][][];
  symbolsMultipliers: {
    [key: number]: {
      multiplier: number;
    }[];
  };
}

class GameServer {
  private app: Express;
  private server: http.Server;
  private io: SocketIOServer;
  private db: sqlite3.Database;
  private port: number;

  constructor() {
    this.port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    this.initializeExpress();
    this.initializeDatabase();
    this.setupServerListeners();
  }

  private initializeExpress(): void {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "https://royalgamescasino.onrender.com",
      },
    });

    this.app.use(express.static(__dirname + '/public'));
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(__dirname + '/public/index.html');
    });
    this.app.use((req: Request, res: Response) => {
      res.sendFile(__dirname + '/public/index.html');
    });
  }

  private initializeDatabase(): void {
    this.db = new sqlite3.Database('./database.db', (err: Error | null) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Connected to the database.');
        this.initializeSockets();
      }
    });
  }

  private setupServerListeners(): void {
    process.on('exit', () => {
      this.db.close();
    });
  }

  private initializeSockets(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('a user connected');

      socket.on('login', async (data: LoginData) => {
        if (data.key === null) {
          const key = md5(uuidv1());
          const username = 'Guest';
          const balance = 10000.00;
          try {
            await this.createNewUser(username, balance, key);
            socket.emit('login', {
              status: 'logged-in',
              key,
              username,
              balance,
            });
          } catch (err) {
            console.log(err);
          }
        } else if (data.key) {
          try {
            const user = await this.getUser(data.key);
            socket.emit('login', {
              status: 'logged-in',
              key: data.key,
              username: user.username,
              balance: user.balance,
            });
          } catch (err) {
            console.log(err);
          }
        }
      });

      socket.on('balance', async (data: { key: string }) => {
        try {
          const account = await this.getUser(data.key);
          socket.emit('balance', account.balance);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('gamestate', async (data: { key: string; gameId: string }) => {
        try {
          const account = await this.getUser(data.key);
          const gamestate = await this.getOrCreateGamestate(account.id, data.gameId);
          socket.emit('gamestate', {
            balance: account.balance,
            bet: gamestate.bet,
            coinValue: gamestate.coin_value,
            reels: JSON.parse(gamestate.reels),
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('bet', async (data: BetData) => {
        try {
          const account = await this.getUser(data.key);
          const betAmount = Math.round((data.bet * 10 * data.coinValue) * 100) / 100;
          if (account.balance >= betAmount) {
            const betResult = this.generateBetResult(data.gameId, betAmount);
            let winAmount = betResult.lines.reduce((sum, line) => sum + line.amount, 0);
            const newBalance = Math.round((account.balance - betAmount + winAmount) * 100) / 100;
            
            await this.updateBalance(account.id, newBalance);
            await this.updateGamestate(account.id, data.gameId, data.bet, data.coinValue, JSON.stringify(betResult.position));
            
            socket.emit('bet', {
              balance: newBalance,
              reels: betResult.position,
              isWin: betResult.lines.length > 0,
              win: betResult.lines,
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    });
  }

  private getGameData(gameId: string): GameData {
    switch (gameId) {
      case 'rock-climber':
        return rockClimberData;
      case 'egyptian-treasures':
        return egyptianTreasuresData;
      default:
        throw new Error('Invalid game ID');
    }
  }

  private generateRandomReelsPosition(gameId: string): number[][] {
    const gameData = this.getGameData(gameId);
    const position: number[][] = [];

    for (let i = 0; i < gameData.reelsCount; i++) {
      position.push(Array.from(
        { length: gameData.reelPositions + 1 },
        () => Math.floor(Math.random() * gameData.symbolsCount) + 1
      ));
    }

    return position;
  }

  private generateBetResult(gameId: string, betAmount: number): BetResult {
    const position = this.generateRandomReelsPosition(gameId);
    const lines = this.processReelsPosition(gameId, betAmount, position);
    return { position, lines };
  }

  private processReelsPosition(gameId: string, betAmount: number, position: number[][]): WinLine[] {
    const gameData = this.getGameData(gameId);
    const result: WinLine[] = [];

    gameData.linesPositions.forEach((linePosition, i) => {
      const symbolsInLine: number[] = [];
      
      for (let j = 0; j < linePosition.length; j++) {
        for (let k = 0; k < linePosition[j].length; k++) {
          if (linePosition[j][k] === 1) {
            symbolsInLine.push(position[j][k]);
          }
        }
      }

      let identicalSymbol = symbolsInLine[0];
      let identicalSymbolsCount = 1;
      
      for (let j = 1; j < symbolsInLine.length; j++) {
        if (identicalSymbol === symbolsInLine[j]) {
          identicalSymbolsCount++;
        } else {
          break;
        }
      }

      if (identicalSymbolsCount >= 3) {
        result.push({
          number: i + 1,
          symbol: identicalSymbol,
          count: identicalSymbolsCount,
          map: linePosition,
          amount: Math.round(betAmount * gameData.symbolsMultipliers[identicalSymbol][identicalSymbolsCount - 3].multiplier * 100) / 100,
        });
      }
    });

    return result;
  }

  private createNewUser(username: string, balance: number, key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO accounts (username, balance, key) VALUES (?, ?, ?)`,
        [username, balance, key],
        function(this: sqlite3.RunResult, err: Error | null) {
          if (err) reject(err.message);
          else resolve(this.lastID);
        }
      );
    });
  }

  private getUser(key: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM accounts WHERE key = ?`,
        [key],
        (err: Error | null, rows: User[]) => {
          if (err) reject(err.message);
          else if (rows.length === 1) {
            this.db.run(
              `UPDATE accounts SET last_login = ? WHERE id = ?`,
              [Date.now(), rows[0].id],
              (err: Error | null) => {
                if (err) reject(err.message);
                else resolve(rows[0]);
              }
            );
          } else {
            reject('Invalid key. Cannot get user.');
          }
        }
      );
    });
  }

  private getOrCreateGamestate(userId: number, gameId: string): Promise<GameState> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM gamestates WHERE user_id = ? AND game_id = ?`,
        [userId, gameId],
        async (err: Error | null, rows: GameState[]) => {
          if (err) reject(err.message);
          else if (rows.length === 1) {
            resolve(rows[0]);
          } else {
            const bet = 10;
            const coinValue = 0.10;
            const reels = JSON.stringify(this.generateRandomReelsPosition(gameId));
            
            try {
              const newGamestate = await new Promise<GameState>((resolve, reject) => {
                this.db.run(
                  `INSERT INTO gamestates (user_id, game_id, reels, bet, coin_value) VALUES (?, ?, ?, ?, ?)`,
                  [userId, gameId, reels, bet, coinValue],
                  function(this: sqlite3.RunResult, err: Error | null) {
                    if (err) reject(err);
                    else resolve({ user_id: userId, game_id: gameId, reels, bet, coin_value: coinValue });
                  }
                );
              });
              resolve(newGamestate);
            } catch (err) {
              reject(err);
            }
          }
        }
      );
    });
  }

  private updateBalance(userId: number, value: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE accounts SET balance = ? WHERE id = ?`,
        [value, userId],
        (err: Error | null) => {
          if (err) reject(err.message);
          else resolve();
        }
      );
    });
  }

  private updateGamestate(
    userId: number,
    gameId: string,
    bet: number,
    coinValue: number,
    reelsPosition: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE gamestates SET reels = ?, bet = ?, coin_value = ? WHERE user_id = ? AND game_id = ?`,
        [reelsPosition, bet, coinValue, userId, gameId],
        (err: Error | null) => {
          if (err) reject(err.message);
          else resolve();
        }
      );
    });
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`);
    });
  }
}

// Create and start server instance
const gameServer = new GameServer();
gameServer.start();

export default GameServer;