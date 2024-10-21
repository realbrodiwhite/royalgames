
import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SocketContext } from '../../context/socket';
import lobbySlice from '../../lobbySlice';

const PrizeWheel = () => {
  const [cooldown, setCooldown] = useState(0);
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const username = useSelector((state) => state.lobby.username);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldown((prevCooldown) => (prevCooldown > 0 ? prevCooldown - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const spinWheel = () => {
    if (cooldown === 0) {
      socket.emit('spinWheel', { username });
      setCooldown(21600); // 6 hours in seconds
    }
  };

  useEffect(() => {
    socket.on('wheelResult', (result) => {
      dispatch(lobbySlice.actions.updateBalance(result.newBalance));
    });
  }, [socket, dispatch]);

  return (
    <div className="PrizeWheel">
      <button onClick={spinWheel} disabled={cooldown > 0}>
        {cooldown > 0 ? `Cooldown: ${Math.floor(cooldown / 3600)}h ${Math.floor((cooldown % 3600) / 60)}m ${cooldown % 60}s` : 'Spin the Wheel'}
      </button>
    </div>
  );
};

export default PrizeWheel;
