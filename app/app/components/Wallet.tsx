"use client";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import {defineChain, } from 'thirdweb'
import {createThirdwebClient} from 'thirdweb';


const opbnb = defineChain(5611);

const CHAIN = opbnb;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;
const THIRDWEB_SECRET_KEY = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY!;

console.log(THIRDWEB_SECRET_KEY);
console.log(CLIENT_ID);
const client = createThirdwebClient({
    clientId: CLIENT_ID,
    secretKey: THIRDWEB_SECRET_KEY,
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