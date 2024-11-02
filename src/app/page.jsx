"use client";
import React from "react";
import RoyalGamesFooter from "../components/royal-games-footer";
import RoyalGamesChatWidget from "../components/royal-games-chat-widget";
import RoyalGamesResponsiveHeader from "../components/royal-games-responsive-header";

function MainComponent() {
  const [currentGame, setCurrentGame] = React.useState({
    name: "Example Game",
    url: "https://example.com/game",
  });

  return (
    <div className="flex flex-col min-h-screen">
      <RoyalGamesResponsiveHeader />

      <main className="flex-grow bg-[#0a0f23] p-4">
        <div className="container mx-auto">
          <div className="bg-[#1b1f38] rounded-lg shadow-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-[#f7b32b] p-4">
              {currentGame.name}
            </h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={currentGame.url}
                title={currentGame.name}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </main>

      <RoyalGamesFooter />
      <RoyalGamesChatWidget />
    </div>
  );
}

export default MainComponent;