"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GamePage() {
  const [playerName, setPlayerName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get player data from localStorage
    const storedPlayerName = localStorage.getItem("playerName");
    const storedWalletAddress = localStorage.getItem("walletAddress");

    if (!storedPlayerName || !storedWalletAddress) {
      // If no player data, redirect to home
      router.push("/");
      return;
    }

    setPlayerName(storedPlayerName);
    setWalletAddress(storedWalletAddress);
  }, [router]);

  const handleBackToVerified = () => {
    router.push("/verified");
  };

  const handleJoinTable = () => {
    setToastMessage("Connecting to a table...");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push("/menu");
    }, 500); // 3.5 seconds
  };

  const formatAddress = (address: string) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative"
      style={{ backgroundColor: "#2C3E50" }}
    >
      {/* Back button */}
      <button
        onClick={handleBackToVerified}
        className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>

      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎮 DOG POKER CLUB GAME</h1>
          <p className="text-xl text-gray-200">Ready to play, {playerName}?</p>
        </div>

        {/* Game options */}
        <div className="w-full mb-8 flex justify-center">
          {/* Join Table */}
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Join Table</h3>
            <p className="text-gray-600 mb-4">Find and join a table with other players</p>
            <button
              onClick={handleJoinTable}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Find Table
            </button>
          </div>
        </div>

        {/* Player info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Player Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">
                  {playerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Player</p>
              <p className="text-gray-800 font-medium">{playerName}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-green-600 font-medium">Verified</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Wallet</p>
              <p className="text-gray-800 font-mono text-sm">{formatAddress(walletAddress)}</p>
            </div>
          </div>
        </div>

        {/* Game rules */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🃏 Game Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Basic Rules:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Standard 52-card deck</li>
                <li>• Texas Hold'em rules</li>
                <li>• Minimum 2 players</li>
                <li>• Maximum 8 players per table</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Fair Play:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Identity verification required</li>
                <li>• Blockchain-secured transactions</li>
                <li>• Transparent game history</li>
                <li>• Anti-cheat protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
