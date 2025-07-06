import { evaluateHand } from "./handEvaluator"

export class BotManager {
  getHandStrength(hand, communityCards) {
    const evaluation = evaluateHand(hand, communityCards)

    const rankValues = {
      "High Card": 0.1,
      "One Pair": 0.2,
      "Two Pair": 0.4,
      "Three of a Kind": 0.6,
      Straight: 0.7,
      Flush: 0.75,
      "Full House": 0.85,
      "Four of a Kind": 0.95,
      "Straight Flush": 0.98,
      "Royal Flush": 1.0,
    }

    return rankValues[evaluation.rank] || 0.1
  }

  calculatePotOdds(callAmount, pot) {
    return callAmount / (pot + callAmount)
  }

  getAggressiveAction(player, context, handStrength) {
    const { pot, lastBetAmount } = context
    const callAmount = lastBetAmount - player.currentBet

    if (handStrength > 0.7) {
      const raiseAmount = Math.min(lastBetAmount + Math.floor(pot * 0.5), player.chips + player.currentBet)
      return { type: "raise", amount: raiseAmount }
    } else if (handStrength > 0.4) {
      if (callAmount === 0) {
        const betAmount = Math.min(Math.floor(pot * 0.3), player.chips)
        return { type: "bet", amount: betAmount }
      } else if (callAmount <= player.chips * 0.3) {
        return { type: "call" }
      }
    } else if (handStrength > 0.2 && callAmount === 0) {
      return { type: "check" }
    }

    return { type: "fold" }
  }

  getConservativeAction(player, context, handStrength) {
    const { pot, lastBetAmount } = context
    const callAmount = lastBetAmount - player.currentBet
    const potOdds = this.calculatePotOdds(callAmount, pot)

    if (handStrength > 0.8) {
      const raiseAmount = Math.min(lastBetAmount + Math.floor(pot * 0.25), player.chips + player.currentBet)
      return { type: "raise", amount: raiseAmount }
    } else if (handStrength > 0.5) {
      if (callAmount === 0) {
        const betAmount = Math.min(Math.floor(pot * 0.2), player.chips)
        return { type: "bet", amount: betAmount }
      } else if (potOdds < 0.3) {
        return { type: "call" }
      }
    } else if (handStrength > 0.3 && callAmount === 0) {
      return { type: "check" }
    }

    return { type: "fold" }
  }

  getBalancedAction(player, context, handStrength) {
    const { pot, lastBetAmount } = context
    const callAmount = lastBetAmount - player.currentBet
    const potOdds = this.calculatePotOdds(callAmount, pot)

    if (handStrength > 0.75) {
      const raiseAmount = Math.min(lastBetAmount + Math.floor(pot * 0.4), player.chips + player.currentBet)
      return { type: "raise", amount: raiseAmount }
    } else if (handStrength > 0.5) {
      if (callAmount === 0) {
        const betAmount = Math.min(Math.floor(pot * 0.25), player.chips)
        return { type: "bet", amount: betAmount }
      } else if (potOdds < 0.4) {
        return { type: "call" }
      }
    } else if (handStrength > 0.25) {
      if (callAmount === 0) {
        return { type: "check" }
      } else if (potOdds < 0.25) {
        return { type: "call" }
      }
    }

    return { type: "fold" }
  }

  getAction(player, context) {
    const handStrength = this.getHandStrength(player.hand, context.communityCards)
    const personality = player.botType || "balanced"

    const randomFactor = Math.random() * 0.1 - 0.05
    const adjustedStrength = Math.max(0, Math.min(1, handStrength + randomFactor))

    console.log(`Bot ${player.name} (${personality}) - Hand strength: ${handStrength.toFixed(2)}`)

    switch (personality) {
      case "aggressive":
        return this.getAggressiveAction(player, context, adjustedStrength)
      case "conservative":
        return this.getConservativeAction(player, context, adjustedStrength)
      case "balanced":
      default:
        return this.getBalancedAction(player, context, adjustedStrength)
    }
  }
}
