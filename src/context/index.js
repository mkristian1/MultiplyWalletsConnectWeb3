import React, { createContext, useState, useEffect } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import abi from "../abi.json";
import { WALLETS } from "../constants";

const CONTRACT_ADDRESS = "0x8B631a8b5E3189c086d0e3A16F8A1E9054de5b52";
const CORRECT_NET_ID = 5;
const INFURA_ID = "506d7529be80444fb659aa0826bce6d6";

export const DAppContext = createContext(null);

export const DAppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const connectToContract = async (provider, signer) => {
    try {
      const instance = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const contractWithSigner = instance.connect(signer);
      let details = {};

      const {
        isActive,
        isPresaleActive,
        mintPrice,
        MAX_SUPPLY,
        name,
        totalSupply = () => {},
        setMerkleRoot = () => {},
      } = contractWithSigner;

      const collectionName = await name();
      const isPublicSaleActive = await isActive();
      const totalSupplyNFT = await MAX_SUPPLY();
      const publicETHPrice = ethers.utils.formatEther(`${await mintPrice()}`);
      const presaleActive = await isPresaleActive();

      const alreadyMinted = Number(await totalSupply());

      details = {
        ...details,
        price: publicETHPrice,
        collectionName,
        isPublicSaleActive,
        presaleActive,
        totalSupplyNFT,
        alreadyMinted,
        setMerkleRoot,
        methods: contractWithSigner,
      };

      setContractDetails(details);
      setLoading(false);
    } catch (error) {
      console.log(error, "Error");
    }
  };

  const providerForWalletType = async (walletType) => {
    switch (walletType) {
      default:
        return window.ethereum;

      case WALLETS.metamask:
        return window?.ethereum;

      case WALLETS.walletconnect:
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: INFURA_ID,
          chainId: CORRECT_NET_ID,
        });

        await walletConnectProvider.enable();
        return walletConnectProvider;

      case WALLETS.coinbase:
        return window.ethereum;
    }
  };

  const connectBrowserWallet = async (walletType) => {
    setLoading(true);
    try {
      // Multiple wallets connect
      const web3Provider = new ethers.providers.Web3Provider(
        await providerForWalletType(walletType)
      );

      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const accounts = await signer.getAddress();
      const balance = await web3Provider.getBalance(accounts);
      const { chainId } = await web3Provider.getNetwork();

      setIsOpen(false);
      toast.success(`Success`);

      if (parseInt(chainId) !== CORRECT_NET_ID)
        return toast.error("Please change to MainNet");

      setUserData({
        account: accounts,
        chainId: Number(chainId),
        accountBalance: Number(ethers.utils.formatEther(balance)),
      });

      await connectToContract(web3Provider, signer, accounts);
      return true;
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetTransactionHash = () => {
    setTransactionHash("");
  };

  useEffect(() => {
    if (!!window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      connectToContract(provider, signer);
    }
  }, []);

  return (
    <DAppContext.Provider
      value={{
        connectBrowserWallet,
        loading,
        transactionHash,
        resetTransactionHash,
        contractDetails,
        userData,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </DAppContext.Provider>
  );
};
