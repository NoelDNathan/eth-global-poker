"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Wallet, Trophy, Check, Star, Coins } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb";
import { createThirdwebClient } from "thirdweb";

const alfajores = defineChain(44787);
const CHAIN = alfajores;
const clientId = "f910c86afed579998a613fe27da700d8";
const client = createThirdwebClient({ clientId });
const REWARDS_CONTRACT_ADDRESS = "0x9C02bb1029bfa54fa9d2B910863b66D81337d85B";

const REWARDS_ABI = [
  {
    inputs: [],
    name: "claimBirthdayReward",
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
    inputs: [],
    name: "claimStraightReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "hasClaimedBirthdayReward",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "hasClaimedWinReward",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "hasClaimedStraightReward",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

export default function Component() {
  const activeAccount = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState({
    birthday: false,
    win: false,
    straight: false,
  });

  // Fetch claim status from contract
  useEffect(() => {
    const fetchClaimStatus = async () => {
      if (!activeAccount) return;
      try {
        const contract = getContract({
          client,
          chain: CHAIN,
          address: REWARDS_CONTRACT_ADDRESS,
          abi: REWARDS_ABI,
        });
        const [birthday, win, straight] = await Promise.all([
          contract.read.hasClaimedBirthdayReward([activeAccount.address]),
          contract.read.hasClaimedWinReward([activeAccount.address]),
          contract.read.hasClaimedStraightReward([activeAccount.address]),
        ]);
        setClaimed({ birthday, win, straight });
      } catch (err) {
        setError("Failed to fetch claim status");
      }
    };
    fetchClaimStatus();
  }, [activeAccount]);

  // Claim handler
  const handleClaim = async (type: "birthday" | "win" | "straight") => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const contract = getContract({
        client,
        chain: CHAIN,
        address: REWARDS_CONTRACT_ADDRESS,
        abi: REWARDS_ABI,
      });
      let transaction;
      if (type === "birthday") {
        transaction = prepareContractCall({ contract, method: "claimBirthdayReward" });
      } else if (type === "win") {
        transaction = prepareContractCall({ contract, method: "claimWinReward" });
      } else if (type === "straight") {
        transaction = prepareContractCall({ contract, method: "claimStraightReward" });
      }
      await sendTransaction({ transaction, account: activeAccount });
      setSuccess(`Claimed ${type} reward!`);
      setClaimed((prev) => ({ ...prev, [type]: true }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Claim failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
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
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* Main Menu Card */}
        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-wide">GAME MENU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-14 bg-red-500 hover:bg-red-400 text-white font-semibold text-lg border-2 border-red-400 shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
              disabled={!activeAccount || claimed.birthday || loading}
              onClick={() => handleClaim("birthday")}
            >
              <Gift className="mr-3 h-5 w-5" />
              {claimed.birthday
                ? "BIRTHDAY CLAIMED"
                : loading
                ? "CLAIMING..."
                : "CLAIM YOUR BIRTHDAY GIFT"}
            </Button>

            <Button
              className="w-full h-14 bg-red-500 hover:bg-red-400 text-white font-semibold text-lg border-2 border-red-400 shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Wallet className="mr-3 h-5 w-5" />
              RECOVER WALLET
            </Button>

            <div className="pt-2">
              <div className="flex items-center justify-center space-x-2 text-red-100">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">Premium Features Available</span>
                <Star className="h-4 w-4 fill-current" />
              </div>
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
                      disabled={!quest.completed || claimed.win || loading}
                      onClick={() => handleClaim("win")}
                      className={
                        claimed.win
                          ? "bg-green-600 hover:bg-green-600"
                          : quest.completed
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-300"
                      }
                    >
                      {claimed.win ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          CLAIMED
                        </>
                      ) : loading ? (
                        "CLAIMING..."
                      ) : (
                        "CLAIM"
                      )}
                    </Button>
                  )}
                  {quest.id === 2 && (
                    <Button
                      size="sm"
                      disabled={!quest.completed || claimed.straight || loading}
                      onClick={() => handleClaim("straight")}
                      className={
                        claimed.straight
                          ? "bg-green-600 hover:bg-green-600"
                          : quest.completed
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-300"
                      }
                    >
                      {claimed.straight ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          CLAIMED
                        </>
                      ) : loading ? (
                        "CLAIMING..."
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
