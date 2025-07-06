export class CheckAction {
  constructor(players, currentPlayerIndex, lastBetAmount, sounds) {
    this.players = players
    this.currentPlayerIndex = currentPlayerIndex
    this.lastBetAmount = lastBetAmount
    this.sounds = sounds
  }

  execute() {
    const player = this.players[this.currentPlayerIndex]
    if (this.lastBetAmount > player.currentBet) {
      console.error("Cannot check when there's a bet to call")
      return
    }
    console.log(`${player.name} checks`)
    this.sounds?.playCheck()
  }
}

export class CallAction {
  constructor(players, currentPlayerIndex, lastBetAmount, setPlayers, setPot, sounds) {
    this.players = players
    this.currentPlayerIndex = currentPlayerIndex
    this.lastBetAmount = lastBetAmount
    this.setPlayers = setPlayers
    this.setPot = setPot
    this.sounds = sounds
  }

  execute() {
    const player = this.players[this.currentPlayerIndex]
    const callAmount = this.lastBetAmount - player.currentBet

    console.log(`${player.name} calls $${callAmount}`)

    this.setPlayers(
      this.players.map((p, i) => {
        if (i === this.currentPlayerIndex) {
          return {
            ...p,
            chips: p.chips - callAmount,
            currentBet: p.currentBet + callAmount,
            allIn: p.chips - callAmount === 0,
          }
        }
        return p
      }),
    )

    this.setPot((prev) => prev + callAmount)
    this.sounds?.playCall()
  }
}

export class BetAction {
  constructor(players, currentPlayerIndex, amount, setPlayers, setPot, setLastBetAmount, setHighestBet, sounds) {
    this.players = players
    this.currentPlayerIndex = currentPlayerIndex
    this.amount = amount
    this.setPlayers = setPlayers
    this.setPot = setPot
    this.setLastBetAmount = setLastBetAmount
    this.setHighestBet = setHighestBet
    this.sounds = sounds
  }

  execute() {
    const player = this.players[this.currentPlayerIndex]
    const actualBet = Math.min(this.amount, player.chips + player.currentBet)
    const betAmount = actualBet - player.currentBet

    console.log(`${player.name} ${player.currentBet === 0 ? "bets" : "raises to"} $${actualBet}`)

    this.setPlayers(
      this.players.map((p, i) => {
        if (i === this.currentPlayerIndex) {
          return {
            ...p,
            chips: p.chips - betAmount,
            currentBet: actualBet,
            allIn: p.chips - betAmount === 0,
          }
        }
        return p
      }),
    )

    this.setPot((prev) => prev + betAmount)
    this.setLastBetAmount(actualBet)
    this.setHighestBet((prev) => Math.max(prev, actualBet))
    this.sounds?.playRaise()
  }
}

export class FoldAction {
  constructor(players, pot, currentPlayerIndex, setPlayers, ResetGame, sounds) {
    this.players = players
    this.pot = pot
    this.currentPlayerIndex = currentPlayerIndex
    this.setPlayers = setPlayers
    this.ResetGame = ResetGame
    this.sounds = sounds
  }

  execute() {
    const player = this.players[this.currentPlayerIndex]
    console.log(`${player.name} folds`)

    const newPlayers = [...this.players]
    newPlayers[this.currentPlayerIndex].inGame = false
    const PlayersInGame = newPlayers.filter((p) => p.inGame)

    if (PlayersInGame.length === 1) {
      this.ResetGame()
    }
    this.setPlayers(newPlayers)
    this.sounds?.playFold()
  }
}
