import { Link } from 'react-router-dom';
import './GameList.scss';
import rockClimberLogo from '../../assets/img/rock-climber-logo.png';
import egyptianTreasuresLogo from '../../assets/img/egyptian-treasures-logo.png';
import { useSelector } from 'react-redux';

const GameList = () => {
  const loggedIn = useSelector((state) => state.lobby.loggedIn);

  const games = [
    {
      logo: egyptianTreasuresLogo,
      name: 'Egyptian Treasures',
      path: '/play/egyptian-treasures',
      alt: 'Egyptian Treasures Slots Game Logo - Royal Games Social Casino',
      ariaLabel: 'Play Egyptian Treasures Slot Game',
    },
    {
      logo: rockClimberLogo,
      name: 'Rock Climber',
      path: '/play/rock-climber',
      alt: 'Rock Climber Slots Game Logo - Royal Games Social Casino',
      ariaLabel: 'Play Rock Climber Slot Game',
    },
  ];

  return (
    <div className="GameList">
      <div className="list">
        {games.map((game) => (
          <div className="game" key={game.name} style={{ position: 'relative' }}>
            <img className="logo" src={game.logo} alt={game.alt} />
            <span>{game.name}</span>
            <Link to={game.path} className="btn-play" aria-label={game.ariaLabel}>
              Play
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};