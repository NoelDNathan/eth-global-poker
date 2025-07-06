"use client";

import { QRVerification } from "./QRVerification";
import { ethers } from "ethers";

const rewardsAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "proofOfHumanAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "year",
        type: "uint256",
      },
    ],
    name: "BirthdayRewardClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "StraightRewardClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "WinRewardClaimed",
    type: "event",
  },
  {
    inputs: [],
    name: "claimBirthdayReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimStraightReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimWinReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasClaimedBirthdayReward",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasClaimedStraightReward",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasClaimedWinReward",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastBirthdayClaimedYear",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proofOfHuman",
    outputs: [
      {
        internalType: "contract IProofOfHuman",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "straightRewardClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "winRewardClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Wallet, Trophy, Check, Star, Coins } from "lucide-react";
import { useActiveAccount, useReadContract, useSendTransaction, useContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { prepareContractCall } from "thirdweb";
import { sendTransaction } from "thirdweb";
import { SmartWallet } from "./Wallet";

const alfajores = defineChain(44787);
const CHAIN = alfajores;
const clientId = "f910c86afed579998a613fe27da700d8";
const client = createThirdwebClient({ clientId });
const REWARDS_CONTRACT_ADDRESS = "0x5df92258830880410b5A1627BB63E871262330Ed";

const contract = getContract({
  client,
  chain: CHAIN,
  address: REWARDS_CONTRACT_ADDRESS,
  abi: rewardsAbi,
});

type UseReadRewardsProps = {
  userAddress: string;
  contract: any;
  setClaimed: (claimed: { birthday: boolean; win: boolean; straight: boolean }) => void;
};

const useReadRewards = ({ userAddress, contract, setClaimed }: UseReadRewardsProps) => {
  console.log("userAddress", userAddress);
  
  const { data: isAddressRegistered, isLoading: loadingIsAddressRegistered } = useReadContract({
    contract: contract,
    method: "function isAddressRegistered(address account) external view returns (bool)",
    params: [userAddress],
  });

  console.log("isAddressRegistered", isAddressRegistered);

  const { data: isYourBirthday, isLoading: loadingIsYourBirthday } = useReadContract({
    contract: contract,
    method: "function isYourBirthday(address user) external view returns (bool)",
    params: [userAddress],
  });

  const { data: hasClaimedBirthday, isLoading: loadingBirthday } = useReadContract({
    contract: contract,
    method: "function hasClaimedBirthdayReward(address user) external view returns (bool)",
    params: [userAddress],
  });

  const { data: hasClaimedWin, isLoading: loadingWin } = useReadContract({
    contract: contract,
    method: "function hasClaimedWinReward(address user) external view returns (bool)",
    params: [userAddress],
  });

  const { data: hasClaimedStraight, isLoading: loadingStraight } = useReadContract({
    contract: contract,
    method: "function hasClaimedStraightReward(address user) external view returns (bool)",
    params: [userAddress],
  });

  useEffect(() => {
    setClaimed({
      birthday: !!hasClaimedBirthday,
      win: !!hasClaimedWin,
      straight: !!hasClaimedStraight,
    });
  }, [hasClaimedBirthday, hasClaimedWin, hasClaimedStraight]);

  


  return {
    isYourBirthday,
    isAddressRegistered,
    hasClaimedBirthday,
    hasClaimedWin,
    hasClaimedStraight,
    loadingBirthday,
    loadingWin,
    loadingStraight,
    loadingIsAddressRegistered,
  };
};

export default function Component() {
  const activeAccount = useActiveAccount();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState({
    birthday: false,
    win: false,
    straight: false,
  });
  const [showQRVerification, setShowQRVerification] = useState(false);
  const [userId, setUserId] = useState(activeAccount?.address || ethers.ZeroAddress);

  const {
    isYourBirthday,
    hasClaimedBirthday,
    hasClaimedWin,
    hasClaimedStraight,
    loadingBirthday,
    loadingWin,
    loadingStraight,
    isAddressRegistered,
  } = useReadRewards({
    userAddress: userId,
    contract: contract,
    setClaimed,
  });

  console.log(
    isYourBirthday,
    hasClaimedBirthday,
    hasClaimedWin,
    hasClaimedStraight,
    loadingBirthday,
    loadingWin,
    loadingStraight
  );

  useEffect(() => {
    setUserId(activeAccount?.address || ethers.ZeroAddress);
  }, [activeAccount]);

  // Write: claim reward
  const handleClaim = async (type: "birthday" | "win" | "straight") => {
    console.log("contract", contract);
    console.log("activeAccount", activeAccount);
    if (!contract || !activeAccount) return;
    let method = "";
    if (type === "birthday") method = "function claimBirthdayReward()";
    if (type === "win") method = "function claimWinReward()";
    if (type === "straight") method = "function claimStraightReward()";

    setError("");
    setSuccess("");
    try {
      const tx = prepareContractCall({
        contract,
        method,
        params: [],
      });
      sendTransaction({
        account: activeAccount,
        transaction: tx,
      }).then((res) => {
        console.log(res);
        setSuccess(`Claimed ${type} reward!`);
      });
    } catch (error: any) {
      setError(error?.message || "Claim failed");
    }
  };

  const handleWalletConnect = async (wallet: { address?: string }) => {
    console.log("wallet", wallet);

    if (wallet) {
      setUserId(wallet.getAccount().address);
      console.log("wallet address", wallet.getAccount().address);
    }
  };

  const quests = [
    {
      id: 1,
      title: "Win with a hand",
      progress: "1/1",
      completed: true,
      reward: "50 coins",
    },
    {
      id: 2,
      title: "Win with straight",
      progress: "1/1",
      completed: true,
      reward: "75 coins",
    },
    {
      id: 3,
      title: "Play 5 games",
      progress: "3/5",
      completed: false,
      reward: "100 coins",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10">
        <SmartWallet onConnect={handleWalletConnect} />
      </div>
      <div className="w-full max-w-5xl grid md:grid-cols-3 gap-6">
        {/* QR Verification Card */}

        <div className="flex flex-col items-center justify-center">
          {!isAddressRegistered && (
            <>
              <Button
                className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowQRVerification((v) => !v)}
              >
                {showQRVerification ? "Hide Verification QR" : "Verify Identity"}
              </Button>
              {showQRVerification && (
                <QRVerification
                  userId={userId}
                  onSuccess={() => window.location.reload()}
                  onError={(err) => setError(err)}
                  onToastMessage={(msg) => setSuccess(msg)}
                />
              )}
            </>
          )}
          {isAddressRegistered && (
            <div className="text-green-600 text-center font-semibold">Identity Verified!</div>
          )}
        </div>

        {/* Main Menu Card */}
        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-wide">GAME MENU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-14 bg-red-500 hover:bg-red-400 text-white font-semibold text-lg border-2 border-red-400 shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
              disabled={
                !activeAccount ||
                claimed.birthday ||
                loadingBirthday ||
                !isYourBirthday ||
                !isAddressRegistered
              }
              onClick={() => handleClaim("birthday")}
            >
              <Gift className="mr-3 h-5 w-5" />
              {loadingBirthday
                ? "Loading..."
                : !isAddressRegistered
                ? "REGISTER TO CLAIM"
                : !isYourBirthday
                ? "NOT YOUR BIRTHDAY"
                : claimed.birthday
                ? "BIRTHDAY CLAIMED"
                : "CLAIM YOUR BIRTHDAY GIFT"}
            </Button>

            {!isAddressRegistered && !loadingBirthday && (
              <div className="text-yellow-400 text-center mt-2">
                You must register your identity to claim rewards.
              </div>
            )}

            <Button
              className="w-full h-14 bg-red-500 hover:bg-red-400 text-white font-semibold text-lg border-2 border-red-400 shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Wallet className="mr-3 h-5 w-5" />
              RECOVER WALLET
            </Button>

            <div className="pt-2">
              <div className="flex items-center justify-center space-x-2 text-red-100"></div>
            </div>

            {error && <div className="text-red-600 text-center mt-2">{error}</div>}
            {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          </CardContent>
        </Card>

        {/* Daily Quests Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
                DAILY QUESTS
              </CardTitle>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {quests.filter((q) => q.completed).length}/{quests.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quests.map((quest, index) => (
              <div key={quest.id}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-800">{quest.title}</span>
                      {quest.completed && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant={quest.completed ? "default" : "secondary"}
                        className={quest.completed ? "bg-green-100 text-green-800" : ""}
                      >
                        {quest.progress}
                      </Badge>
                      <span className="text-sm text-slate-600 flex items-center">
                        <Coins className="h-3 w-3 mr-1" />
                        {quest.reward}
                      </span>
                    </div>
                  </div>

                  {/* Win and Straight claim buttons */}
                  {quest.id === 1 && (
                    <Button
                      size="sm"
                      disabled={
                        !quest.completed || claimed.win || loadingWin || !isAddressRegistered
                      }
                      onClick={() => handleClaim("win")}
                      className={
                        claimed.win
                          ? "bg-green-600 hover:bg-green-600"
                          : quest.completed
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-300"
                      }
                    >
                      {loadingWin ? (
                        "Loading..."
                      ) : !isAddressRegistered ? (
                        "REGISTER TO CLAIM"
                      ) : claimed.win ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          CLAIMED
                        </>
                      ) : (
                        "CLAIM"
                      )}
                    </Button>
                  )}
                  {quest.id === 2 && (
                    <Button
                      size="sm"
                      disabled={
                        !quest.completed ||
                        claimed.straight ||
                        loadingStraight ||
                        !isAddressRegistered
                      }
                      onClick={() => handleClaim("straight")}
                      className={
                        claimed.straight
                          ? "bg-green-600 hover:bg-green-600"
                          : quest.completed
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-300"
                      }
                    >
                      {loadingStraight ? (
                        "Loading..."
                      ) : !isAddressRegistered ? (
                        "REGISTER TO CLAIM"
                      ) : claimed.straight ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          CLAIMED
                        </>
                      ) : (
                        "CLAIM"
                      )}
                    </Button>
                  )}
                  {/* For other quests, keep the default UI */}
                  {quest.id > 2 && (
                    <Button size="sm" disabled={true} className="bg-slate-300">
                      LOCKED
                    </Button>
                  )}
                </div>
                {index < quests.length - 1 && <Separator className="my-2" />}
              </div>
            ))}

            <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="text-center">
                <p className="text-sm font-medium text-yellow-800">
                  Complete all quests for bonus rewards!
                </p>
                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(quests.filter((q) => q.completed).length / quests.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
