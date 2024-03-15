import { faCog, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Header.scss";
import { useSelector } from "react-redux";
import React from "react";
import { useEffect, useContext } from "react";
import { SocketContext } from "../../context/socket";
import store from "../../store";
import lobbySlice from "../../lobbySlice";
const Header = React.memo(() => {
  const { username, balance } = useSelector((state) => state.lobby);
  const loggedIn = useSelector((state) => state.lobby.loggedIn);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.emit("balance", {
      key: localStorage.getItem("key"),
    });

    socket.on("balance", (balance) => {
      store.dispatch(lobbySlice.actions.updateBalance(balance));
    });
  }, []);

  return (
    <header className="Header">
      <div className="brand">
        <img src="public/logo192.png" alt="Royal Games Logo" className="logo" />
        <span className="name">Royal Games</span>
      </div>

      <nav className={`menu ${!loggedIn ? "d-none" : ""}`}>
        <div className="account">
          <button className="btn-toggle-account-menu">
            <FontAwesomeIcon icon={faUserCircle} size="2x" />
            <span>{username}</span>
          </button>
        </div>

        <button className="btn-settings">
          <FontAwesomeIcon icon={faCog} size="2x"></FontAwesomeIcon>
        </button>
      </nav>

      <div className={`balance ${!loggedIn ? "d-none" : ""}`}>
        <span className="label">Balance</span>
        <span className="value">
          €
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </header>
  );
});

Header.propTypes = {
  // Add prop types here
};

export default Header;
