// src/App.js

import './App.scss'; // Importing CSS styles for the application from App.scss file
import Header from './features/header/Header'; // Importing Header component from features/header/Header.js file
import {
  BrowserRouter, Route, Routes // Importing BrowserRouter, Route, and Routes components from react-router-dom library
} from 'react-router-dom';
import Game from './features/game/Game'; // Importing Game component from features/game/Game.js file
import GameList from './features/game-list/GameList'; // Importing GameList component from features/game-list/GameList.js file
import { Fragment } from 'react'; // Importing Fragment component from react library

/**
 * The main application component
 */
function App() {
  return (
    /**
     * The root element of the application with a class name of "App"
     */
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
           <Fragment>
              <Header></Header>
              <GameList></GameList>
            </Fragment>
          }></Route>
          <Route path="/play/:gameId" element={<Game></Game>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App; // Exporting the App component as the default export of the file