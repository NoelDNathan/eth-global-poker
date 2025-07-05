import React from "react";

interface Card {
  src: string;
  alt: string;
}

interface PlayerCardsProps {
  cards: Card[];
}

const PlayerCards: React.FC<PlayerCardsProps> = ({ cards }) => {
  return (
    <div className="flex space-x-2 justify-center">
      {cards.map((card, idx) => (
        <img
          key={idx}
          src={card.src}
          alt={card.alt}
          className="w-16 h-24 rounded shadow-md bg-white"
        />
      ))}
    </div>
  );
};

export default PlayerCards;
