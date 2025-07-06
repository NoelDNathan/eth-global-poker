import { PlayerHand } from "./PlayerHand"

export const PlayerPositions = ({
  players,
  currentPlayerIndex,
  gameState,
  humanPlayerHand,
  dealtCards,
  userAddress,
}) => {
  if (players.length === 0) {
    return null
  }

  const userPlayerIndex = players.findIndex((player) => !player.isAI)
  const startPlayerIndex = userPlayerIndex === -1 ? 0 : userPlayerIndex

  const getPlayerPosition = (index, totalPlayers) => {
    const angle = (((index - startPlayerIndex) % totalPlayers) * (360 / totalPlayers) + 90) * (Math.PI / 180)
    const radius = 42

    const x = 50 + radius * Math.cos(angle)
    const y = 35 + radius * Math.sin(angle)
    return {
      top: `${y}%`,
      left: `${x}%`,
    }
  }

  return (
    <>
      {players.map((player, index) => {
        if (!player.isVisible) {
          return null
        }
        const position = getPlayerPosition(index, players.length)
        const isCurrentPlayer = currentPlayerIndex === index
        const isUser = player.isUser

        return (
          <div
            key={player.id}
            style={{ top: position.top, left: position.left }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              isCurrentPlayer ? "scale-110 z-20" : "z-10"
            }`}
          >
            {/* Player info card */}
            <div
              className={`
              ${
                isUser
                  ? "bg-gradient-to-r from-blue-700 to-blue-800 border-blue-500"
                  : "bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600"
              } 
              ${isCurrentPlayer ? "ring-4 ring-yellow-400 ring-opacity-75 shadow-2xl" : "shadow-lg"}
              p-4 rounded-xl text-white border-2 min-w-[180px] text-center transition-all duration-300
            `}
            >
              <h2 className={`text-lg font-bold mb-2 ${isUser ? "text-blue-200" : "text-white"}`}>
                {player.name}
                {player.position && (
                  <span className="ml-2 text-xs bg-amber-600 px-2 py-1 rounded-full">{player.position}</span>
                )}
              </h2>

              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-300">Chips:</span>
                  <span className="font-bold text-green-400">${player.chips}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-300">Bet:</span>
                  <span className="font-bold text-yellow-400">${player.currentBet}</span>
                </p>

                {!player.inGame && (
                  <p className="text-red-400 font-bold text-xs bg-red-900 px-2 py-1 rounded">FOLDED</p>
                )}
                {player.allIn && (
                  <p className="text-purple-400 font-bold text-xs bg-purple-900 px-2 py-1 rounded">ALL IN</p>
                )}
                {player.isUser && humanPlayerHand && (
                  <p className="text-amber-300 font-semibold text-xs mt-2 bg-amber-900 px-2 py-1 rounded">
                    {humanPlayerHand}
                  </p>
                )}
              </div>
            </div>

            {/* Player cards */}
            <div className="mt-3 flex justify-center">
              <PlayerHand
                cards={player.hand}
                hidden={player.isAI && gameState !== "showdown"}
                isDealt={dealtCards[index]}
                isFolded={!player.inGame}
              />
            </div>
          </div>
        )
      })}
    </>
  )
}
