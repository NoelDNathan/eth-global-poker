"use client"

import { motion } from "framer-motion"

const suitColors = {
  "♠": "text-black",
  "♥": "text-red-600",
  "♦": "text-red-600",
  "♣": "text-black",
  $: "text-gray-500",
}

export const Card = ({ suit, rank, hidden = false, isDealt = false, isFolded = false }) => {
  const cardVariants = {
    undealt: { opacity: 0, scale: 0.8, y: -50 },
    dealt: { opacity: 1, scale: 1, y: 0 },
    folded: { opacity: 0, scale: 0, rotateY: 180 },
  }

  return (
    <motion.div
      className="w-20 h-28 bg-white rounded-xl shadow-xl flex flex-col items-center justify-between p-3 border-2 border-gray-200"
      initial="undealt"
      animate={isFolded ? "folded" : isDealt ? "dealt" : "undealt"}
      variants={cardVariants}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: isFolded ? 0.3 : 0.5,
      }}
    >
      {hidden ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold shadow-inner border border-blue-500">
          <div className="text-2xl">🂠</div>
        </div>
      ) : (
        <>
          <div className={`text-lg font-bold ${suitColors[suit]}`}>{rank}</div>
          <div className={`text-4xl ${suitColors[suit]}`}>{suit}</div>
          <div className={`text-lg font-bold ${suitColors[suit]} self-end rotate-180`}>{rank}</div>
        </>
      )}
    </motion.div>
  )
}

export const nullCard = {
  suit: "$",
  rank: "NULL",
  hidden: false,
  isDealt: false,
  isFolded: false,
}
