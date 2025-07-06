"use client"

import { useState } from "react"

export const BettingControls = ({ onBet, pot, maxBet, minBet, currentBet, highestBet }) => {
  const [customBet, setCustomBet] = useState(Math.max(highestBet + 2, minBet))

  const handleCustomBet = () => {
    const betAmount = Math.max(customBet, minBet)
    onBet(betAmount)
  }

  const handlePercentageBet = (percentage) => {
    const betAmount = Math.max(Math.floor(pot * percentage), minBet)
    setCustomBet(betAmount)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Custom bet input */}
      <div className="flex space-x-3 items-center">
        <input
          type="number"
          value={customBet}
          onChange={(e) =>
            setCustomBet(Math.max(Number.parseInt(e.target.value) || 0, Math.max(highestBet + 2, minBet)))
          }
          className="w-32 px-4 py-2 text-black rounded-lg border-2 border-gray-300 focus:border-amber-500 focus:outline-none text-center font-bold text-lg"
          min={minBet}
          max={maxBet}
        />
        <button
          onClick={handleCustomBet}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-2 px-6 rounded-lg shadow-lg border border-amber-500 transition-all duration-200 hover:shadow-xl"
        >
          💰 {currentBet < minBet ? "Raise" : "Bet"}
        </button>
      </div>

      {/* Quick bet buttons */}
      <div className="flex space-x-2 flex-wrap justify-center">
        <button
          onClick={() => handlePercentageBet(0.3)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg shadow-md border border-purple-500 transition-all duration-200 hover:shadow-lg text-sm"
        >
          30% Pot
        </button>
        <button
          onClick={() => handlePercentageBet(0.5)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg shadow-md border border-purple-500 transition-all duration-200 hover:shadow-lg text-sm"
        >
          50% Pot
        </button>
        <button
          onClick={() => handlePercentageBet(0.75)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg shadow-md border border-purple-500 transition-all duration-200 hover:shadow-lg text-sm"
        >
          75% Pot
        </button>
        <button
          onClick={() => handlePercentageBet(1.5)}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2 px-4 rounded-lg shadow-md border border-orange-500 transition-all duration-200 hover:shadow-lg text-sm"
        >
          150% Pot
        </button>
        <button
          onClick={() => onBet(maxBet)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-4 rounded-lg shadow-md border border-red-500 transition-all duration-200 hover:shadow-lg text-sm"
        >
          🚀 All In
        </button>
      </div>
    </div>
  )
}
