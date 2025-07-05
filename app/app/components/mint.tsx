"use client";

import React, { useState, useEffect } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { ethers } from "ethers";

// Same configuration as Wallet.tsx
const alfajores = defineChain(44787);
const CHAIN = alfajores;
const clientId = "f910c86afed579998a613fe27da700d8";

const client = createThirdwebClient({
  clientId: clientId,
});

// Default ERC20 contract address - Updated from deployments
const DEFAULT_CONTRACT_ADDRESS = "0xD64e458DC462be1aBd9a384248Cd976BE7b2a189";

// Standard ERC20 mint function ABI with common errors
const ERC20_MINT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Common ERC20 errors
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "allowance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      { name: "sender", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [{ name: "approver", type: "address" }],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [{ name: "receiver", type: "address" }],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [{ name: "sender", type: "address" }],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [{ name: "spender", type: "address" }],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  // Access control errors
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "neededRole", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [{ name: "role", type: "bytes32" }],
    name: "AccessControlBadConfirmation",
    type: "error",
  },
  // Custom errors that might be thrown
  {
    inputs: [],
    name: "MintingNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyOwner",
    type: "error",
  },
] as const;

interface MintButtonProps {
  contractAddress?: string;
  onMintSuccess?: (txHash: string) => void;
  onMintError?: (error: string) => void;
}

export const MintButton: React.FC<MintButtonProps> = ({
  contractAddress: propContractAddress,
  onMintSuccess,
  onMintError,
}) => {
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();

  console.log(activeAccount);
  console.log(activeWallet);

  const [contractAddress, setContractAddress] = useState(
    propContractAddress || DEFAULT_CONTRACT_ADDRESS
  );
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeAccount?.address) {
      setRecipientAddress(activeAccount.address);
    }
  }, [activeAccount]);

  const handleMint = async () => {
    if (!activeAccount || !activeWallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      setError("Please enter a valid contract address");
      return;
    }

    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      setError("Please enter a valid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");
    setTxHash("");

    try {
      // Get the contract instance
      const contract = getContract({
        client,
        chain: CHAIN,
        address: contractAddress,
        abi: ERC20_MINT_ABI,
      });

      // Convert amount to wei (assuming 18 decimals)
      const amountInWei = ethers.parseUnits(amount, 18);

      // Prepare the transaction
      const transaction = prepareContractCall({
        contract,
        method: "mint",
        params: [recipientAddress, amountInWei],
      });

      // Send the transaction
      const result = await sendTransaction({
        transaction,
        account: activeAccount,
      });

      setTxHash(result.transactionHash);
      onMintSuccess?.(result.transactionHash);

      // Reset form
      setAmount("");
    } catch (err: unknown) {
      console.error("Mint error:", err);

      let errorMessage = "Failed to mint tokens";

      if (err instanceof Error) {
        // Add specific error handling for paymaster issues
        if (err.message.includes("Unknown paymaster version")) {
          errorMessage =
            "Smart wallet configuration error: The paymaster version is not supported. Please check your account abstraction settings.";
        } else if (err.message.includes("paymaster")) {
          errorMessage =
            "Gas sponsorship error: There's an issue with the paymaster configuration.";
        } else if (err.message.includes("0x118cdaa7")) {
          errorMessage =
            "Access denied: You don't have permission to mint tokens on this contract. This error typically means the contract has access control restrictions.";
        } else if (err.message.includes("AccessControlUnauthorizedAccount")) {
          errorMessage = "Access denied: Your account doesn't have minting permissions";
        } else if (err.message.includes("OnlyOwner")) {
          errorMessage = "Access denied: Only the contract owner can mint tokens";
        } else if (err.message.includes("MintingNotAllowed")) {
          errorMessage = "Minting is not allowed on this contract";
        } else if (err.message.includes("ERC20InvalidReceiver")) {
          errorMessage = "Invalid recipient address";
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to pay for gas";
        } else if (err.message.includes("not found on ABI")) {
          errorMessage =
            "Contract function not found. This might not be a standard ERC20 token contract with a public mint function.";
        } else if (err.message.includes("execution reverted")) {
          errorMessage =
            "Transaction failed: The contract rejected the mint operation. Please check if this contract allows minting and if you have the necessary permissions.";
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      onMintError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = contractAddress && recipientAddress && amount && parseFloat(amount) > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mint ERC20 Token</h2>
        <p className="text-gray-600 text-sm">
          Mint tokens to any address on {CHAIN.name || "Alfajores"}
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This will attempt to call the 'mint' function on the contract.
            Make sure the contract has a public mint function and that your address has permission
            to mint.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Contract Address Input - Pre-filled and readonly */}
        <div>
          <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Token Contract Address
          </label>
          <input
            id="contractAddress"
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Default contract address is pre-configured</p>
        </div>

        {/* Recipient Address Input */}
        <div>
          <label
            htmlFor="recipientAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipient Address
          </label>
          <input
            id="recipientAddress"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount to Mint
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.000000000000000001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={!isFormValid || isLoading || !activeAccount}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            isFormValid && activeAccount && !isLoading
              ? "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Minting...
            </div>
          ) : (
            "Mint Tokens"
          )}
        </button>

        {/* Wallet Connection Status */}
        {!activeAccount && (
          <div className="text-center text-gray-500 text-sm">
            Please connect your wallet to mint tokens
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <p className="text-sm font-medium">Tokens minted successfully!</p>
          <p className="text-xs mt-1 break-all">Transaction: {txHash}</p>
          <a
            href={`https://celoscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            View on Celoscan
          </a>
        </div>
      )}
    </div>
  );
};

export default MintButton;
