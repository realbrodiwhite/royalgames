import './App.scss';
import Header from './components/header/Header';
import {
  BrowserRouter, Route, Routes
} from 'react-router-dom';
import Game from './components/game/Game';
import GameList from './components/game-list/GameList';
import { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function App() {
  const loggedIn = useSelector((state) => state.lobby.loggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
    }
  }, [loggedIn, navigate]);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Fragment>
            <Header></Header>
            <GameList></GameList>
          </Fragment>}></Route>
          <Route path="/play/:gameId" element={<Game></Game>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
