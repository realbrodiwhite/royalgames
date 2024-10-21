// src/components/game/Game.tsx
import React, { useEffect } from 'react';

interface GameProps {
  gameScriptName: string;
}

const Game: React.FC<GameProps> = ({ gameScriptName }) => {
  useEffect(() => {
    let isMounted = true;

    const loadGameScript = async () => {
      try {
        const gameModule = await import(`@/gamescripts/${gameScriptName}`);
        if (isMounted && typeof gameModule.default === 'function') {
          gameModule.default(); // Initialize the game
        }
      } catch (error) {
        console.error(`Failed to load game script: ${gameScriptName}`, error);
      }
    };

    loadGameScript();

    return () => {
      isMounted = false;
    };
  }, [gameScriptName]);

  return <div id="game-container"></div>;
};

export default Game;
