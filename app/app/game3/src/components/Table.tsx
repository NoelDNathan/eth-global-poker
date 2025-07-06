import { CommunityCards } from "./CommunityCards"
import { PlayerPositions } from "./PlayerPositions"

export const Table = ({
  pot,
  gameState,
  lastBetAmount,
  communityCards,
  visibleCards,
  players,
  currentPlayerIndex,
  humanPlayerHand,
  dealtCards,
  userAddress,
}) => {
  return (
    <div className="relative w-full max-w-6xl aspect-[5/3] mb-8">
      {/* Poker Table */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-900 rounded-full border-8 border-amber-600 shadow-2xl flex items-center justify-center">
        {/* Inner felt texture */}
        <div className="absolute inset-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full opacity-80"></div>

        {/* Table rail */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-700 shadow-inner"></div>

        {/* Pot display */}
        <div className="absolute top-[70%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl shadow-lg border border-amber-500">
            <div className="text-2xl font-bold text-center">💰 ${pot}</div>
            <div className="text-sm text-amber-200 text-center">Total Pot</div>
          </div>
        </div>

        {/* Game info */}
        <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-4 rounded-xl shadow-lg border border-slate-600 text-center">
            <div className="text-xl font-bold text-emerald-400 capitalize mb-1">{gameState}</div>
            <div className="text-sm text-slate-300">Last Bet: ${lastBetAmount}</div>
          </div>
        </div>

        {/* Community cards area */}
        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <CommunityCards cards={communityCards} visibleCards={visibleCards} />
        </div>
      </div>

      <PlayerPositions
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        gameState={gameState}
        humanPlayerHand={humanPlayerHand}
        dealtCards={dealtCards}
        userAddress={userAddress}
      />
    </div>
  )
}
