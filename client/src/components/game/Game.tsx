import { useEffect, useRef } from 'react';
import './Game.scss';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../context/socket';
import { Application } from 'pixi.js';
import Reel from '../slot/reel';
import SlotGame from '../slot/slotGame';
import initControls from '../slot/initControls';
import gsap from 'gsap';

interface GameProps {
  onGameLoad?: () => void;
}

interface GameInstance {
  renderer: Application;  // Using PIXI.Application type only
  destroy: () => void;
}

const Game: React.FC<GameProps> = ({ onGameLoad }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ gameId: string }>();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      console.error('Socket connection not available');
      return;
    }

    let game: GameInstance | undefined;

    const initGame = async () => {
      try {
        const response = await axios.get(`../gamescripts/${params.gameId}.js`);
        
        game = (new Function(`
          const gameId = arguments[0];
          const Game = arguments[1];
          const Reel = arguments[2];
          const initControls = arguments[3];
          const socket = arguments[4];
          const PIXI = arguments[5];
          const gsap = arguments[6];
          const goToLobby = arguments[7];

          ${response.data}
        `))(
          params.gameId, 
          SlotGame, 
          Reel, 
          initControls, 
          socket,
          Application, 
          gsap, 
          () => { navigate('/'); }
        ) as GameInstance;

        if (!elRef.current) return;

        const gameCanvas = elRef.current.querySelector('canvas');
        if (gameCanvas) {
          gameCanvas.remove();
        }

        elRef.current.appendChild(game.renderer.view as HTMLCanvasElement);
        onGameLoad?.();

        // Setup game-specific socket events
        socket.on('game_state_update', (data) => {
          console.log('Game state update:', data);
          // Handle game state updates
        });

        socket.on('game_error', (error) => {
          console.error('Game error:', error);
          // Handle game errors
        });

      } catch (error) {
        console.error('Failed to load game script:', error);
        navigate('/');
      }
    };

    initGame();

    return () => {
      if (game) {
        game.destroy();
      }
      // Cleanup socket event listeners
      if (socket) {
        socket.off('game_state_update');
        socket.off('game_error');
      }
    };
  }, [navigate, params.gameId, socket, onGameLoad]);

  if (!socket) {
    return (
      <div className="Game-loading">
        <span>Connecting to server...</span>
      </div>
    );
  }

  return (
    <div 
      className="Game"
      ref={elRef}
    />
  );
};

export default Game;