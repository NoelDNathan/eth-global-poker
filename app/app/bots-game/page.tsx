"use client";
import React, { useState, useCallback } from "react";
import { BotsTable } from "./components/Table";
import { BotsPlayerManager } from "./components/PlayerManager";
import { PlayerControls } from "../reference-ui/components/PlayerControls";
import { CommunityCards } from "../reference-ui/components/CommunityCards";
import { createDeck, shuffleDeck } from "../reference-ui/components/../utils/deck";
import { evaluateHand } from "../reference-ui/components/../utils/handEvaluator";
import {
  Card as CardType,
  Player,
  GameState,
} from "../reference-ui/components/../../types/poker_types";

const MIN_PLAYERS = 4;
const STARTING_CHIPS = 1000;
const SMALL_BLIND = 5;
const BIG_BLIND = 10;

const createBotPlayer = (id: number, cards: CardType[]): Player => ({
  id,
  name: `Bot ${id + 1}`,
  hand: cards,
  chips: STARTING_CHIPS,
  currentBet: 0,
  inGame: true,
  isAI: true,
  allIn: false,
  position: null,
  address: undefined,
});

const BotsPokerGame: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [pot, setPot] = useState(0);
  const [gameState, setGameState] = useState<GameState>("preflop");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [highestBet, setHighestBet] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);

  // Initialize a new hand with bots only
  const startNewHand = useCallback(() => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    const newPlayers = Array.from({ length: MIN_PLAYERS }, (_, i) =>
      createBotPlayer(i, newDeck.slice(i * 2, i * 2 + 2))
    );
    // Assign positions
    const newDealerIndex = (dealerIndex + 1) % newPlayers.length;
    setDealerIndex(newDealerIndex);
    const sbIndex = (newDealerIndex + 1) % newPlayers.length;
    const bbIndex = (newDealerIndex + 2) % newPlayers.length;
    newPlayers[newDealerIndex].position = "Dealer";
    newPlayers[sbIndex].position = "SB";
    newPlayers[bbIndex].position = "BB";
    // Post blinds
    newPlayers[sbIndex].chips -= SMALL_BLIND;
    newPlayers[sbIndex].currentBet = SMALL_BLIND;
    newPlayers[bbIndex].chips -= BIG_BLIND;
    newPlayers[bbIndex].currentBet = BIG_BLIND;
    setCommunityCards(newDeck.slice(newPlayers.length * 2, newPlayers.length * 2 + 5));
    setPot(SMALL_BLIND + BIG_BLIND);
    setGameState("preflop");
    setLastBetAmount(BIG_BLIND);
    setHighestBet(BIG_BLIND);
    setPlayers(newPlayers);
    setCurrentPlayerIndex((bbIndex + 1) % newPlayers.length);
  }, [dealerIndex]);

  // Simulate bot actions (very basic random logic for demo)
  const botAction = useCallback(() => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const player = newPlayers[currentPlayerIndex];
      if (!player.inGame) return newPlayers;
      // Simple random fold/call/raise
      const action = Math.random();
      if (action < 0.2) {
        player.inGame = false; // Fold
      } else if (action < 0.7) {
        const callAmount = highestBet - player.currentBet;
        player.chips -= callAmount;
        player.currentBet += callAmount;
        setPot((p) => p + callAmount);
      } else {
        const raise = highestBet + SMALL_BLIND;
        const raiseAmount = raise - player.currentBet;
        player.chips -= raiseAmount;
        player.currentBet += raiseAmount;
        setPot((p) => p + raiseAmount);
        setHighestBet(raise);
        setLastBetAmount(raiseAmount);
      }
      return newPlayers;
    });
    setCurrentPlayerIndex((i) => (i + 1) % players.length);
  }, [currentPlayerIndex, highestBet, players.length]);

  // Start game on mount
  React.useEffect(() => {
    startNewHand();
  }, []);

  // Simulate bot turns
  React.useEffect(() => {
    if (players.length === 0) return;
    const timer = setTimeout(() => {
      botAction();
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentPlayerIndex, players]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900">
      <h1 className="text-3xl font-bold text-white mb-4">Bots Poker Table</h1>
      <BotsTable
        players={players}
        communityCards={communityCards}
        pot={pot}
        dealerIndex={dealerIndex}
        gameState={gameState}
        lastBetAmount={lastBetAmount}
      />
      <BotsPlayerManager players={players} currentPlayerIndex={currentPlayerIndex} />
      <CommunityCards cards={communityCards} />
      {/* No PlayerControls, Wallets, or blockchain elements */}
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={startNewHand}>
        New Hand
      </button>
    </div>
  );
};

export default BotsPokerGame;
