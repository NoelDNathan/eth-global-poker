export const GAME_CONSTANTS = {
  LIMITS: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 8,
    MIN_AI_PLAYERS: 1,
    MIN_BET: 1,
    MAX_RAISES_PER_ROUND: 4,
  },

  INITIAL: {
    CHIPS: 1000,
    SMALL_BLIND: 5,
    BIG_BLIND: 10,
    TIMER: 30,
  },

  TIMING: {
    DEAL_CARD: 500,
    AI_ACTION_DELAY: 1000,
    ROUND_TRANSITION: 1500,
  },

  AI_PROBABILITIES: {
    FOLD_THRESHOLD: 0.8,
    RAISE_THRESHOLD: 0.5,
    BLUFF_CHANCE: 0.2,
  },

  HAND_VALUES: {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10,
  },

  ERROR_MESSAGES: {
    INVALID_ACTION: "Invalid action for current game state",
    INSUFFICIENT_FUNDS: "Player does not have sufficient funds",
    INVALID_BET: "Invalid bet amount",
    PLAYER_NOT_FOUND: "Player not found",
    GAME_STATE_ERROR: "Invalid game state transition",
  },
}

export const CARDS = {
  SUITS: ["♠", "♥", "♦", "♣"],
  RANKS: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"],
  SUIT_COLORS: {
    "♠": "text-black",
    "♥": "text-red-600",
    "♦": "text-red-600",
    "♣": "text-black",
  },
}

export const TABLE_POSITIONS = {
  BUTTON: "BTN",
  SMALL_BLIND: "SB",
  BIG_BLIND: "BB",
}

export const GAME_STATES = {
  PREFLOP: "preflop",
  FLOP: "flop",
  TURN: "turn",
  RIVER: "river",
  SHOWDOWN: "showdown",
}

export const VALID_STATE_TRANSITIONS = {
  preflop: ["flop"],
  flop: ["turn"],
  turn: ["river"],
  river: ["showdown"],
  showdown: ["preflop"],
}
