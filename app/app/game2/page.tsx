"use client";
import React, { useState } from "react";
import PokerTable from "./components/PokerTable";
import PlayerPanel from "./components/PlayerPanel";
import CommunityCards from "./components/CommunityCards";
import PlayerCards from "./components/PlayerCards";
import ActionBar from "./components/ActionBar";

// Placeholder for new or custom components
// import CommunityCards from "./components/CommunityCards";
// import PlayerCards from "./components/PlayerCards";

// Components to be created in ./components:
// PokerTable, PlayerPanel, CommunityCards, PlayerCards, ActionBar

const Game2Page: React.FC = () => {
  // Example static data for now
  const players = [
    {
      id: 1,
      name: "PLAYER 1",
      avatar: "/PLAYER 1.png",
      chips: 575,
      bet: 50,
      status: "CALLED",
      isYou: false,
      bgColor: "#b6ffb6",
    },
    {
      id: 2,
      name: "PLAYER 2",
      avatar: "/PLAYER 2.png",
      chips: 420,
      bet: 30,
      status: "FOLDED",
      isYou: true,
      bgColor: "#ffb6b6",
    },
  ];

  const communityCards = [
    { src: "/cards/spades-jack.png", alt: "J♠" },
    { src: "/cards/spades-ten.png", alt: "T♠" },
    { src: "/cards/heart-jack.png", alt: "J♥" },
    { src: "/cards/clubs-five.png", alt: "5♣" },
    { src: "/cards/BACK.png", alt: "Back" },
  ];

  const playerCards = [
    { src: "/cards/clubs-ace.png", alt: "A♣" },
    { src: "/cards/heart-queen.png", alt: "Q♥" },
  ];

  // State for bet and balance (example values)
  const [bet, setBet] = useState(50);
  const [balance] = useState(485);

  // Action handlers (stub)
  const handleFold = () => alert("Folded");
  const handleCheck = () => alert("Checked");
  const handleRaise = () => alert("Raised");
  const handleCall = () => alert("Called");
  const handleAllIn = () => alert("All In");

  return (
    <div className="min-h-screen bg-[#34495e] flex flex-col items-center justify-center relative">
      <PokerTable>
        {/* Pot Display */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <span className="text-white text-lg font-bold tracking-widest">POT</span>
          <span className="text-white text-5xl font-bold mt-1">150</span>
        </div>
        {/* Players */}
        <div className="w-full flex justify-between items-center px-24 absolute top-0 left-0 z-20">
          {players.map((player) => (
            <PlayerPanel
              key={player.id}
              avatar={player.avatar}
              name={player.name}
              chips={player.chips}
              bet={player.bet}
              status={player.status as "CALLED" | "FOLDED" | ""}
              isYou={player.isYou}
              bgColor={player.bgColor}
            />
          ))}
        </div>
        {/* Community Cards */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <CommunityCards cards={communityCards} />
        </div>
        {/* Player Cards */}
        <div className="absolute left-1/2 bottom-32 -translate-x-1/2 z-30">
          <PlayerCards cards={playerCards} />
        </div>
        {/* Action Bar */}
        <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-full max-w-2xl z-40">
          <ActionBar
            bet={bet}
            balance={balance}
            onBetChange={setBet}
            onFold={handleFold}
            onCheck={handleCheck}
            onRaise={handleRaise}
            onCall={handleCall}
            onAllIn={handleAllIn}
          />
        </div>
      </PokerTable>
    </div>
  );
};

export default Game2Page;
