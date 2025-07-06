"use client"

import { Card } from "./Card"
import { motion } from "framer-motion"

export const CommunityCards = ({ cards, visibleCards }) => {
  return (
    <motion.div
      className="flex space-x-2 justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {cards.map((card, index) => (
        <Card key={index} suit={card.suit} rank={card.rank} isDealt={index < visibleCards} />
      ))}
    </motion.div>
  )
}
