import React from "react";

interface ActionBarProps {
  bet: number;
  balance: number;
  onBetChange: (bet: number) => void;
  onFold: () => void;
  onCheck: () => void;
  onRaise: () => void;
  onCall: () => void;
  onAllIn: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  bet,
  balance,
  onBetChange,
  onFold,
  onCheck,
  onRaise,
  onCall,
  onAllIn,
}) => {
  return (
    <div className="flex flex-col items-center space-y-2 bg-black bg-opacity-60 p-4 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min={0}
          max={balance}
          value={bet}
          onChange={(e) => onBetChange(Number(e.target.value))}
          className="w-40"
        />
        <input
          type="number"
          min={0}
          max={balance}
          value={bet}
          onChange={(e) => onBetChange(Number(e.target.value))}
          className="w-20 px-2 py-1 rounded text-black"
        />
        <span className="text-white text-sm">/ {balance} chips</span>
      </div>
      <div className="flex space-x-2 mt-2">
        <button
          onClick={onFold}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
        >
          Fold
        </button>
        <button
          onClick={onCheck}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
        >
          Check
        </button>
        <button
          onClick={onCall}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        >
          Call
        </button>
        <button
          onClick={onRaise}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
        >
          Raise
        </button>
        <button
          onClick={onAllIn}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
        >
          All In
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
