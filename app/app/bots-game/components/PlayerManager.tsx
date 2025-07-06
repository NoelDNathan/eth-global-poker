import React from "react";
import { Player } from "../../reference-ui/components/../../types/poker_types";

interface PlayerManagerProps {
  players: Player[];
  currentPlayerIndex: number;
}

export const BotsPlayerManager: React.FC<PlayerManagerProps> = ({
  players,
  currentPlayerIndex,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <span className="text-white font-bold">Players:</span>
      <div className="flex gap-4">
        {players.map((player, idx) => (
          <div
            key={player.id}
            className={`p-2 rounded shadow text-center w-24 ${
              idx === currentPlayerIndex ? "bg-blue-700 text-white" : "bg-gray-200"
            }`}
          >
            <div className="font-bold">{player.name}</div>
            <div>Chips: {player.chips}</div>
            <div>{player.inGame ? "In Game" : "Folded"}</div>
            {player.position && <div className="text-xs">{player.position}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
