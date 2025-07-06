import React from "react";
import { BotsCommunityCards } from "./CommunityCards";
import { Card, Player } from "../../reference-ui/components/../../types/poker_types";

interface TableProps {
  pot: number;
  gameState: string;
  lastBetAmount: number;
  communityCards: Card[];
  players: Player[];
  dealerIndex: number;
}

export const BotsTable: React.FC<TableProps> = ({
  pot,
  gameState,
  lastBetAmount,
  communityCards,
  players,
  dealerIndex,
}) => {
  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] mb-24">
      <div className="absolute inset-0 bg-green-700 rounded-full border-8 border-brown-600 shadow-lg flex items-center justify-center">
        <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold">
          Pot: ${pot}
        </div>
        <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl font-bold text-center">
          <div>Round: {gameState}</div>
          <div>Last Bet: ${lastBetAmount}</div>
        </div>
        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <BotsCommunityCards cards={communityCards} />
        </div>
      </div>
      {/* You can add a custom player positions component here if needed */}
    </div>
  );
};
