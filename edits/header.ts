import { FC, useContext, useEffect } from 'react';
import { faCog, faCrown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.scss';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { SocketContext } from '../../context/socket';
import store from '../../store';
import lobbySlice from '../../lobbySlice';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  const username = useSelector((state: RootState) => state.lobby.username);
  const balance = useSelector((state: RootState) => state.lobby.balance);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket?.emit('balance', {
      key: localStorage.getItem('key'),
    });

    socket?.on('balance', (balance: number) => {
      store.dispatch(lobbySlice.actions.updateBalance(balance));
    });

    return () => {
      socket?.off('balance');
    };
  }, [socket]);

  return (
    <div className="Header">
      <div className="brand">
        <FontAwesomeIcon
          icon={faCrown}
          size="2x"
          className="logo"
        />
        <span className="name">Royal Games</span>
      </div>

      <div className="menu">
        <div className="account">
          <button className="btn-toggle-account-menu">
            <FontAwesomeIcon icon={faUserCircle} size="2x" />
            <span>{username}</span>
          </button>
        </div>

        <button className="btn-settings">
          <FontAwesomeIcon icon={faCog} size="2x" />
        </button>
      </div>

      <div className="balance">
        <span className="label">Credits</span>
        <span className="value">
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
};

export default Header;
