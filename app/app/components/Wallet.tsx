"use client";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb";
import { createThirdwebClient } from "thirdweb";

const opbnb = defineChain(5611);
const alfajores = defineChain(44787);

const CHAIN = alfajores;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;

console.log(CLIENT_ID);
const clientId = "f910c86afed579998a613fe27da700d8";
const FACTORY_ADDRESS = "0x86f31e10350d364b00bb3f85f0f9a49aa69151c3";

const client = createThirdwebClient({
  clientId: clientId,
});

const wallets = [
  inAppWallet({
    auth: {
      options: ["wallet", "google"],
    },
  }),
];

const accountAbstraction = {
  chain: CHAIN,
  factoryAddress: FACTORY_ADDRESS,
  sponsorGas: true,
};

interface WalletProps {
  onConnect: (wallet: any) => void;
}

console.log("factory address", FACTORY_ADDRESS);
export const SmartWallet = ({ onConnect }: WalletProps) => {
  return (
    <ConnectButton
      client={client}
      chain={CHAIN}
      connectButton={{
        label: "Login",
      }}
      wallets={wallets}
      accountAbstraction={accountAbstraction}
      onConnect={(wallet) => {
        console.log("Connected wallet:", wallet);
        onConnect(wallet);
      }}
      onDisconnect={() => {}}
    />
  );
};
