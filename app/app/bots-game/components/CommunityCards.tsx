import React from "react";
import { Card } from "../../reference-ui/components/../../types/poker_types";

interface CommunityCardsProps {
  cards: Card[];
}

export const BotsCommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  return (
    <div className="flex space-x-2 justify-center">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded shadow p-2 w-12 h-16 flex flex-col items-center justify-center"
        >
          <span className="text-lg font-bold">{card.rank}</span>
          <span className="text-xl">{card.suit}</span>
        </div>
      ))}
    </div>
  );
};
