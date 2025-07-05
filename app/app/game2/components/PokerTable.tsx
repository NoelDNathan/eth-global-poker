import React from "react";

interface PokerTableProps {
  children: React.ReactNode;
}

const PokerTable: React.FC<PokerTableProps> = ({ children }) => {
  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] mb-24">
      <div className="absolute inset-0 bg-green-700 rounded-full border-8 border-yellow-900 shadow-lg flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default PokerTable;
