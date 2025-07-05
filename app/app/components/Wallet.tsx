"use client";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import {defineChain, } from 'thirdweb'
import {createThirdwebClient} from 'thirdweb';


const opbnb = defineChain(5611);

const CHAIN = opbnb;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;

console.log(CLIENT_ID);
const clientId = "f910c86afed579998a613fe27da700d8";
const FACTORY_ADDRESS = "0x86f31e10350D364B00bB3F85F0f9a49aa69151C3";

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
  gasless: true,
};

interface WalletProps {
  onConnect: (wallet: any) => void;
}


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
        onConnect(wallet);
      }}
      onDisconnect={() => {
      }}
    />



  );
};


const traditonalWallets = [createWallet("io.metamask"), createWallet("com.coinbase.wallet")];
export const TraditionalLogin = ({onConnect}: WalletProps) => {
  return <ConnectButton client={client} chain={CHAIN} wallets={traditonalWallets} onConnect={(wallet) => {
      onConnect(wallet);
  }} />;

};