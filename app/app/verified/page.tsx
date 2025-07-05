"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifiedPage() {
  const [playerName, setPlayerName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedPlayerName = localStorage.getItem("playerName") || "Player";
    const storedWalletAddress = localStorage.getItem("walletAddress") || "";

    setPlayerName(storedPlayerName);
    setWalletAddress(storedWalletAddress);
  }, []);

  const handleStartGame = () => {
    router.push("/search-game");
  };

  const handleDisconnectWallet = () => {
    localStorage.removeItem("playerName");
    localStorage.removeItem("walletAddress");
    router.push("/");
  };

  const formatAddress = (address: string) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Complete</h1>
          <p className="text-gray-600">Welcome to DOG POKER CLUB</p>
        </div>

        {/* Player info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Player Name</label>
              <p className="text-gray-800 font-medium">{playerName}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Wallet Address</label>
              <p className="text-gray-800 font-mono text-sm">{formatAddress(walletAddress)}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Status</label>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Start Playing
          </button>
          <button
            onClick={handleDisconnectWallet}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
