import React from "react";

interface PlayerPanelProps {
  avatar: string;
  name: string;
  chips: number;
  bet: number;
  status: "CALLED" | "FOLDED" | "";
  isYou: boolean;
  bgColor: string;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  avatar,
  name,
  chips,
  bet,
  status,
  isYou,
  bgColor,
}) => {
  return (
    <div
      className="flex flex-col items-center p-2 rounded-lg shadow-lg min-w-[120px]"
      style={{ background: bgColor, border: isYou ? "2px solid gold" : undefined }}
    >
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-white mb-1" />
      <span className="font-bold text-white text-sm">{name}</span>
      <span className="text-yellow-200 text-xs">Chips: {chips}</span>
      <span className="text-blue-200 text-xs">Bet: {bet}</span>
      {status && (
        <span
          className={`text-xs font-semibold ${
            status === "FOLDED" ? "text-red-400" : "text-green-300"
          }`}
        >
          {status}
        </span>
      )}
      {isYou && <span className="text-xs text-yellow-300 font-bold mt-1">You</span>}
    </div>
  );
};

export default PlayerPanel;
