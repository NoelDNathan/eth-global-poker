"use client"
import { useState, useEffect, useCallback } from "react"
import { PlayerControls } from "./PlayerControls"
import { initializeSounds } from "../utils/sounds"
import { evaluateHand } from "../utils/handEvaluator"
import { CheckAction, CallAction, BetAction, FoldAction } from "../utils/gameCommands"
import { createDeck, shuffleDeck } from "../utils/deck"
import { Table } from "./Table"
import { BotManager } from "../utils/BotManager"

export const PokerGame = () => {
  const [players, setPlayers] = useState([])
  const [deck, setDeck] = useState([])
  const [communityCards, setCommunityCards] = useState([])
  const [pot, setPot] = useState(0)
  const [gameState, setGameState] = useState("preflop")
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [lastBetAmount, setLastBetAmount] = useState(0)
  const [dealtCards, setDealtCards] = useState([])
  const [highestBet, setHighestBet] = useState(0)
  const [sounds, setSounds] = useState(null)
  const [humanPlayerHand, setHumanPlayerHand] = useState("")
  const [smallBlind] = useState(5)
  const [bigBlind] = useState(10)
  const [dealerIndex, setDealerIndex] = useState(0)
  const [botManager] = useState(new BotManager())
  const [roundStartPlayerIndex, setRoundStartPlayerIndex] = useState(0)
  const [playersActedThisRound, setPlayersActedThisRound] = useState(new Set())

  const createNewPlayer = (id, isAI, cards, name, balance = 1000, botType = "balanced") => {
    return {
      id,
      name: name || (isAI ? `Bot ${id}` : "You"),
      hand: cards,
      chips: balance,
      currentBet: 0,
      inGame: true,
      isAI,
      allIn: false,
      position: null,
      isUser: !isAI,
      isVisible: true,
      botType,
    }
  }

  const getNextActivePlayerIndex = (startIndex, players) => {
    let nextIndex = startIndex
    do {
      nextIndex = (nextIndex + 1) % players.length
    } while (!players[nextIndex].inGame || players[nextIndex].allIn)
    return nextIndex
  }

  const startNewHand = useCallback(() => {
    const newDeck = shuffleDeck(createDeck())
    setDeck(newDeck)

    let newPlayers =
      players.length === 0
        ? [
            createNewPlayer(0, false, newDeck.slice(0, 2), "You"),
            createNewPlayer(1, true, newDeck.slice(2, 4), "Aggressive Bot", 1000, "aggressive"),
            createNewPlayer(2, true, newDeck.slice(4, 6), "Conservative Bot", 1000, "conservative"),
            createNewPlayer(3, true, newDeck.slice(6, 8), "Balanced Bot", 1000, "balanced"),
          ]
        : players.map((player, index) => ({
            ...player,
            hand: newDeck.slice(index * 2, index * 2 + 2),
            currentBet: 0,
            inGame: player.chips > 0,
            allIn: false,
            position: null,
          }))

    newPlayers = newPlayers.filter((player) => player.chips > 0)

    if (newPlayers.length < 2) {
      alert("Game Over! Not enough players with chips.")
      return
    }

    const newDealerIndex = dealerIndex % newPlayers.length
    setDealerIndex(newDealerIndex)
    const sbIndex = (newDealerIndex + 1) % newPlayers.length
    const bbIndex = (newDealerIndex + 2) % newPlayers.length

    newPlayers[newDealerIndex].position = "Dealer"
    newPlayers[sbIndex].position = "SB"
    newPlayers[bbIndex].position = "BB"

    const sbAmount = Math.min(smallBlind, newPlayers[sbIndex].chips)
    const bbAmount = Math.min(bigBlind, newPlayers[bbIndex].chips)

    newPlayers[sbIndex].chips -= sbAmount
    newPlayers[sbIndex].currentBet = sbAmount
    newPlayers[bbIndex].chips -= bbAmount
    newPlayers[bbIndex].currentBet = bbAmount

    if (newPlayers[sbIndex].chips === 0) newPlayers[sbIndex].allIn = true
    if (newPlayers[bbIndex].chips === 0) newPlayers[bbIndex].allIn = true

    setCommunityCards(newDeck.slice(newPlayers.length * 2, newPlayers.length * 2 + 5))
    setPot(sbAmount + bbAmount)
    setGameState("preflop")
    setLastBetAmount(bbAmount)
    setHighestBet(bbAmount)

    // En preflop, el primer jugador después del BB actúa primero
    const firstPlayerIndex = getNextActivePlayerIndex(bbIndex, newPlayers)
    setCurrentPlayerIndex(firstPlayerIndex)
    setRoundStartPlayerIndex(firstPlayerIndex)
    setPlayersActedThisRound(new Set())

    setPlayers(newPlayers)
    setDealtCards(new Array(newPlayers.length).fill(false))

    newPlayers.forEach((_, index) => {
      setTimeout(() => {
        setDealtCards((prev) => {
          const newDealtCards = [...prev]
          newDealtCards[index] = true
          return newDealtCards
        })
      }, index * 500)
    })

    const humanPlayer = newPlayers.find((p) => !p.isAI)
    if (humanPlayer) {
      const evaluation = evaluateHand(humanPlayer.hand, [])
      setHumanPlayerHand(evaluation.description)
    }
  }, [players, dealerIndex, smallBlind, bigBlind])

  const progressToNextRound = useCallback(() => {
    if (gameState === "river") {
      setGameState("showdown")
      return
    }

    const nextState = {
      preflop: "flop",
      flop: "turn",
      turn: "river",
    }[gameState]

    if (nextState) {
      setGameState(nextState)
      setPlayers((prevPlayers) => prevPlayers.map((player) => ({ ...player, currentBet: 0 })))
      setLastBetAmount(0)
      setHighestBet(0)
      setPlayersActedThisRound(new Set())

      // Después del preflop, el primer jugador activo después del dealer actúa primero
      const activePlayers = players.filter((p) => p.inGame && !p.allIn)
      if (activePlayers.length > 0) {
        let nextPlayerIndex = (dealerIndex + 1) % players.length
        while (!players[nextPlayerIndex].inGame || players[nextPlayerIndex].allIn) {
          nextPlayerIndex = (nextPlayerIndex + 1) % players.length
        }
        setCurrentPlayerIndex(nextPlayerIndex)
        setRoundStartPlayerIndex(nextPlayerIndex)
      }
    }
  }, [gameState, players, dealerIndex])

  const isRoundComplete = useCallback(() => {
    const activePlayers = players.filter((p) => p.inGame && !p.allIn)

    if (activePlayers.length <= 1) {
      return true
    }

    // Verificar si todos los jugadores activos han actuado
    const playersWhoNeedToAct = activePlayers.filter((p) => !playersActedThisRound.has(p.id))

    // Si hay jugadores que no han actuado, la ronda no está completa
    if (playersWhoNeedToAct.length > 0) {
      return false
    }

    // Verificar si todas las apuestas están igualadas
    const currentBets = activePlayers.map((p) => p.currentBet)
    const allBetsEqual = currentBets.every((bet) => bet === Math.max(...currentBets))

    return allBetsEqual
  }, [players, playersActedThisRound])

  const moveToNextPlayer = useCallback(() => {
    const activePlayers = players.filter((p) => p.inGame && !p.allIn)

    if (activePlayers.length <= 1) {
      setGameState("showdown")
      if (activePlayers.length === 1) {
        const winner = activePlayers[0]
        setPlayers((prevPlayers) => prevPlayers.map((p) => (p.id === winner.id ? { ...p, chips: p.chips + pot } : p)))
        setTimeout(() => {
          alert(`${winner.name} wins $${pot}!`)
          setTimeout(startNewHand, 1000)
        }, 500)
      }
      return
    }

    // Marcar que el jugador actual ha actuado
    setPlayersActedThisRound((prev) => new Set([...prev, players[currentPlayerIndex].id]))

    // Verificar si la ronda está completa
    if (isRoundComplete()) {
      progressToNextRound()
    } else {
      // Mover al siguiente jugador activo
      const nextIndex = getNextActivePlayerIndex(currentPlayerIndex, players)
      setCurrentPlayerIndex(nextIndex)
    }
  }, [players, currentPlayerIndex, isRoundComplete, progressToNextRound, pot, startNewHand])

  const handleCheck = useCallback(() => {
    const player = players[currentPlayerIndex]
    if (player.currentBet < lastBetAmount) {
      console.error("Cannot check when there's a bet to call")
      return
    }

    const checkCommand = new CheckAction(players, currentPlayerIndex, lastBetAmount, sounds)
    checkCommand.execute()
    moveToNextPlayer()
  }, [players, currentPlayerIndex, lastBetAmount, sounds, moveToNextPlayer])

  const handleCall = useCallback(() => {
    const callCommand = new CallAction(players, currentPlayerIndex, lastBetAmount, setPlayers, setPot, sounds)
    callCommand.execute()
    moveToNextPlayer()
  }, [players, currentPlayerIndex, lastBetAmount, setPlayers, setPot, sounds, moveToNextPlayer])

  const handleBet = useCallback(
    (amount) => {
      const betCommand = new BetAction(
        players,
        currentPlayerIndex,
        amount,
        setPlayers,
        setPot,
        setLastBetAmount,
        setHighestBet,
        sounds,
      )
      betCommand.execute()

      // Cuando alguien hace bet/raise, todos los demás jugadores necesitan actuar de nuevo
      setPlayersActedThisRound(new Set([players[currentPlayerIndex].id]))

      moveToNextPlayer()
    },
    [players, currentPlayerIndex, setPlayers, setPot, setLastBetAmount, setHighestBet, sounds, moveToNextPlayer],
  )

  const handleFold = useCallback(() => {
    const foldCommand = new FoldAction(players, pot, currentPlayerIndex, setPlayers, () => {}, sounds)
    foldCommand.execute()
    moveToNextPlayer()
  }, [players, currentPlayerIndex, setPlayers, sounds, moveToNextPlayer, pot])

  const botAction = useCallback(() => {
    const player = players[currentPlayerIndex]
    if (!player || !player.isAI) return

    const action = botManager.getAction(player, {
      pot,
      lastBetAmount,
      communityCards: communityCards.slice(0, visibleCommunityCards()),
      gameState,
      players,
    })

    setTimeout(
      () => {
        switch (action.type) {
          case "fold":
            handleFold()
            break
          case "check":
            handleCheck()
            break
          case "call":
            handleCall()
            break
          case "bet":
          case "raise":
            handleBet(action.amount || lastBetAmount + smallBlind)
            break
        }
      },
      1000 + Math.random() * 1000,
    )
  }, [
    players,
    currentPlayerIndex,
    botManager,
    pot,
    lastBetAmount,
    communityCards,
    gameState,
    handleFold,
    handleCheck,
    handleCall,
    handleBet,
    smallBlind,
  ])

  const determineWinner = useCallback(() => {
    const activePlayers = players.filter((p) => p.inGame)
    if (activePlayers.length === 0) return "No active players!"

    if (activePlayers.length === 1) {
      const winner = activePlayers[0]
      setPlayers((prevPlayers) => prevPlayers.map((p) => (p.id === winner.id ? { ...p, chips: p.chips + pot } : p)))
      return `${winner.name} wins $${pot}!`
    }

    const winner = activePlayers[Math.floor(Math.random() * activePlayers.length)]
    setPlayers((prevPlayers) => prevPlayers.map((p) => (p.id === winner.id ? { ...p, chips: p.chips + pot } : p)))
    return `${winner.name} wins $${pot}!`
  }, [players, pot])

  const visibleCommunityCards = useCallback(() => {
    switch (gameState) {
      case "preflop":
        return 0
      case "flop":
        return 3
      case "turn":
        return 4
      case "river":
      case "showdown":
        return 5
      default:
        return 0
    }
  }, [gameState])

  const isUserTurn = useCallback(() => {
    return players[currentPlayerIndex] && !players[currentPlayerIndex].isAI
  }, [players, currentPlayerIndex])

  const canUserCheck = useCallback(() => {
    const player = players[currentPlayerIndex]
    return player && player.currentBet === lastBetAmount
  }, [players, currentPlayerIndex, lastBetAmount])

  useEffect(() => {
    startNewHand()
  }, [])

  useEffect(() => {
    if (players[currentPlayerIndex]?.isAI && gameState !== "showdown") {
      botAction()
    }
  }, [players, currentPlayerIndex, gameState, botAction])

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const soundsInstance = await initializeSounds()
        setSounds(soundsInstance)
      } catch (error) {
        console.error("Failed to load sounds:", error)
      }
    }
    loadSounds()
  }, [])

  useEffect(() => {
    const humanPlayer = players.find((p) => !p.isAI)
    if (humanPlayer) {
      const evaluation = evaluateHand(humanPlayer.hand, communityCards.slice(0, visibleCommunityCards()))
      setHumanPlayerHand(evaluation.description)
    }
  }, [players, communityCards, gameState, visibleCommunityCards])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 rounded-xl shadow-2xl border border-amber-500">
          <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
            🃏 <span className="text-amber-100">Texas Hold'em Poker</span>
          </h3>
          <p className="text-amber-200">Professional Poker vs AI Bots</p>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <button
          onClick={startNewHand}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg border border-emerald-500 transition-all duration-200 hover:shadow-xl"
        >
          🔄 New Hand
        </button>
      </div>

      <Table
        pot={pot}
        gameState={gameState}
        lastBetAmount={lastBetAmount}
        communityCards={communityCards}
        visibleCards={visibleCommunityCards()}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        humanPlayerHand={humanPlayerHand}
        dealtCards={dealtCards}
        userAddress=""
      />

      {/* Debug info */}
      <div className="absolute bottom-6 left-6 bg-black bg-opacity-50 text-white p-4 rounded text-sm">
        <div>Current Player: {players[currentPlayerIndex]?.name}</div>
        <div>Players Acted: {playersActedThisRound.size}</div>
        <div>Active Players: {players.filter((p) => p.inGame && !p.allIn).length}</div>
        <div>Round Complete: {isRoundComplete() ? "Yes" : "No"}</div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-6xl mt-8">
        {isUserTurn() && gameState !== "showdown" && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-2xl shadow-2xl border border-slate-600">
            <PlayerControls
              _onCheck={handleCheck}
              _onCall={handleCall}
              _onBet={handleBet}
              _onFold={handleFold}
              pot={pot}
              maxBet={players[currentPlayerIndex]?.chips || 0}
              currentBet={players[currentPlayerIndex]?.currentBet || 0}
              lastBetAmount={lastBetAmount}
              minRaise={Math.max(highestBet + 2, lastBetAmount + 1)}
              highestBet={highestBet}
              canCheck={canUserCheck()}
            />
          </div>
        )}

        {gameState === "showdown" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const result = determineWinner()
                alert(result)
                setTimeout(startNewHand, 1000)
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg border border-purple-500 transition-all duration-200 hover:shadow-xl text-lg"
            >
              🏆 Reveal Winner & Next Hand
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
