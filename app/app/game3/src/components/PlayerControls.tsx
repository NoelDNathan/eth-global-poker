"use client"
import { BettingControls } from "./BettingControls"

export const PlayerControls = ({
  _onCheck,
  _onCall,
  _onBet,
  _onFold,
  pot,
  maxBet,
  currentBet,
  lastBetAmount,
  minRaise,
  highestBet,
  canCheck,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Action buttons */}
      <div className="flex space-x-4">
        {canCheck ? (
          <button
            onClick={_onCheck}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg border border-emerald-500 transition-all duration-200 hover:shadow-xl text-lg"
          >
            ✓ Check
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={_onCall}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg border border-blue-500 transition-all duration-200 hover:shadow-xl text-lg"
            >
              📞 Call ${lastBetAmount - currentBet}
            </button>
            <button
              onClick={_onFold}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg border border-red-500 transition-all duration-200 hover:shadow-xl text-lg"
            >
              🗂️ Fold
            </button>
          </div>
        )}
      </div>

      {/* Betting controls */}
      <BettingControls
        onBet={_onBet}
        pot={pot}
        maxBet={maxBet}
        minBet={Math.max(currentBet, minRaise)}
        currentBet={currentBet}
        highestBet={highestBet}
      />
    </div>
  )
}
