"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

import { SmartWallet } from "./components/Wallet";
import { QRVerification } from "./components/QRVerification";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

export default function Home() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [userId, setUserId] = useState(ethers.ZeroAddress);
  const [playerName, setPlayerName] = useState("");
  const [showQRVerification, setShowQRVerification] = useState(false);
  const router = useRouter();

  const displayToast = (message: string): void => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleWalletConnect = async (wallet: { address?: string }) => {
    console.log("wallet", wallet);
    console.log("metamask()", getMetaMaskAddress());
    const originalWallet = await getMetaMaskAddress();
    if (wallet && originalWallet) {
      setUserId(originalWallet);
      // Save wallet address to localStorage
      localStorage.setItem("walletAddress", originalWallet);
      displayToast("Wallet connected successfully!");
    }
  };

  const handleStartVerification = () => {
    if (userId === ethers.ZeroAddress) {
      displayToast("Please connect your wallet first!");
      return;
    }
    if (!playerName.trim()) {
      displayToast("Please enter your player name!");
      return;
    }
    setShowQRVerification(true);
  };

  const handleVerificationSuccess = () => {
    // Save player name to localStorage
    localStorage.setItem("playerName", playerName);
    displayToast(`Verification completed successfully! Welcome, ${playerName}!`);
    setShowQRVerification(false);
    // Redirect to verified page after a short delay
    setTimeout(() => {
      router.push("/verified");
    }, 1500);
  };

  const handleVerificationError = (error: string) => {
    displayToast(error);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative"
      style={{ backgroundColor: "#2C3E50" }}
    >
      {/* SmartWallet in top right */}
      <div className="absolute top-4 right-4 z-10">
        <SmartWallet onConnect={handleWalletConnect} />
      </div>

      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">DOG POKER CLUB</h1>
        <p className="text-sm sm:text-base text-gray-200 px-2">
          Connect your wallet and start identity verification
        </p>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-center">
          {!showQRVerification ? (
            // Welcome screen with start button
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md text-center">
              <div className="mb-6">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Identity Verification</h2>
                <p className="text-gray-600 text-sm">
                  Verify your identity using the Self Protocol to proceed
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 mb-6">
                {/* Player Name Input */}
                <div className="w-full">
                  <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={handleNameChange}
                    placeholder="Enter your player name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                    maxLength={50}
                  />
                </div>

                {/* User Address */}
                <div className="w-full">
                  <span className="block text-gray-500 text-xs uppercase tracking-wide mb-2">
                    User Address
                  </span>
                  <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
                    {userId !== ethers.ZeroAddress ? (
                      userId
                    ) : (
                      <span className="text-gray-400">Not connected</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartVerification}
                disabled={userId === ethers.ZeroAddress || !playerName.trim()}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  userId === ethers.ZeroAddress || !playerName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {userId === ethers.ZeroAddress
                  ? "Connect Wallet First"
                  : !playerName.trim()
                  ? "Enter Player Name"
                  : "Start Verification"}
              </button>
            </div>
          ) : (
            // QR Verification component
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQRVerification(false)}
                className="absolute -top-4 -right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <QRVerification
                userId={userId}
                onSuccess={handleVerificationSuccess}
                onError={handleVerificationError}
                onToastMessage={displayToast}
              />
            </div>
          )}
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

async function getMetaMaskAddress() {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request account access if needed
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      // Get the first account
      const address = accounts[0];
      console.log("MetaMask Address:", address);
      return address;
    } catch (error) {
      console.error("Error fetching MetaMask address:", error);
    }
  } else {
    console.error("MetaMask is not installed!");
  }
}
