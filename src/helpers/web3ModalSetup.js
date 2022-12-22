import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

/**
  Web3 modal helps us "connect" external wallets:
**/
const web3ModalSetup = () =>
  new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            // 97: "https://data-seed-prebsc-1-s1.binance.org:8545/", // avax
             56: "https://bsc-dataseed.binance.org",
             5: "https://goerli.infura.io/v3/57b59f4ada61437eb6c386afae37ec80",
          },
        },
      },
    },
  });

export default web3ModalSetup;
