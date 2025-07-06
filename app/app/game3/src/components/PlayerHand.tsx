"use client"

import { Card } from "./Card"
import { motion } from "framer-motion"

export const PlayerHand = ({ cards, hidden = false, isDealt = false, isFolded = false }) => {
  return (
    <motion.div
      className="flex space-x-2"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {cards
        .filter((card) => card !== undefined)
        .map((card, index) => {
          return (
            <Card key={index} suit={card.suit} rank={card.rank} hidden={hidden} isDealt={isDealt} isFolded={isFolded} />
          )
        })}
    </motion.div>
  )
}
