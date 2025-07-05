import React from "react";

interface Card {
  src: string;
  alt: string;
}

interface CommunityCardsProps {
  cards: Card[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
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

export default CommunityCards;
