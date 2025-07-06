// utils is one level below components, so use a relative path
import { nullCard } from "../components/Card"

const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

function sortCards(cards) {
  return cards.sort((a, b) => rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank))
}

function getCardCounts(cards) {
  const counts = new Map()
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1)
  }
  return counts
}

function isFlush(cards) {
  return cards.every((card) => card.suit === cards[0].suit)
}

function isStraight(cards) {
  const ranks = cards.map((card) => rankOrder.indexOf(card.rank))
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] !== ranks[i - 1] - 1) {
      return false
    }
  }
  return true
}

export function evaluateHand(playerCards, communityCards) {
  if (playerCards.filter((card) => card !== nullCard && card !== undefined && card !== null).length == 0) {
    return { rank: "", description: " " }
  }

  const allCards = sortCards([...playerCards, ...communityCards])
  const cardCounts = getCardCounts(allCards)

  if (isFlush(allCards) && isStraight(allCards) && allCards[0].rank === "A") {
    return { rank: "Royal Flush", description: "Royal Flush" }
  }

  if (isFlush(allCards) && isStraight(allCards)) {
    return { rank: "Straight Flush", description: `Straight Flush, ${allCards[0].rank} high` }
  }

  const fourOfAKind = [...cardCounts.entries()].find(([_, count]) => count === 4)
  if (fourOfAKind) {
    return { rank: "Four of a Kind", description: `Four of a Kind, ${fourOfAKind[0]}s` }
  }

  const threeOfAKind = [...cardCounts.entries()].find(([_, count]) => count === 3)
  const pair = [...cardCounts.entries()].find(([_, count]) => count === 2)
  if (threeOfAKind && pair) {
    return { rank: "Full House", description: `Full House, ${threeOfAKind[0]}s full of ${pair[0]}s` }
  }

  if (isFlush(allCards)) {
    return { rank: "Flush", description: `Flush, ${allCards[0].rank} high` }
  }

  if (isStraight(allCards)) {
    return { rank: "Straight", description: `Straight, ${allCards[0].rank} high` }
  }

  if (threeOfAKind) {
    return { rank: "Three of a Kind", description: `Three of a Kind, ${threeOfAKind[0]}s` }
  }

  const pairs = [...cardCounts.entries()].filter(([_, count]) => count === 2)
  if (pairs.length === 2) {
    return { rank: "Two Pair", description: `Two Pair, ${pairs[0][0]}s and ${pairs[1][0]}s` }
  }

  if (pairs.length === 1) {
    return { rank: "One Pair", description: `One Pair, ${pairs[0][0]}s` }
  }

  return { rank: "High Card", description: `High Card, ${allCards[0].rank}` }
}
