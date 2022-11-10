import cn from "classnames";
import { useContext, useEffect, useRef } from "react";
import { imgCoinBase, imgMetamask, imgWalletConnect } from "../../assets";
import { DAppContext } from "../../context";
import styles from "./ModalMultiplyWallets.module.scss";

const ModalMultiplyWallets = ({ isOpen, setIsOpen }) => {
  const { connectBrowserWallet, loading } = useContext(DAppContext);
  const refOverlay = useRef(null);
  const isMetaMask = window?.ethereum?.isMetaMask;

  const walletsData = [
    {
      id: 1,
      name: "Metamask",
      img: imgMetamask,
      status: window?.ethereum?.isMetaMask,
    },
    {
      id: 2,
      name: "Coinbase",
      img: imgCoinBase,
      status: window?.ethereum?.isCoinbaseWallet,
    },
    { id: 3, name: "WalletConnect", img: imgWalletConnect, status: true },
  ];

  useEffect(() => {
    const handleClickOutside = ({ target }) => {
      if (isOpen && refOverlay.current && target.contains(refOverlay.current)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      <div
        ref={refOverlay}
        className={cn(styles["overlay"], {
          [styles["overlay_active"]]: isOpen,
        })}
      />
      {isOpen && (
        <div className={cn(styles["modal"])}>
          <div className={styles["modal__header"]}>
            <h2>Connect Wallet</h2>
            <button
              className={styles["modal__close"]}
              onClick={() => setIsOpen(false)}
            >
              X
            </button>
          </div>
          <div className={styles["modal__body"]}>
            <div className={styles["wallets"]}>
              {walletsData.map((wallet) => (
                <button
                  disabled={loading && !wallet.status}
                  key={wallet.id}
                  className={cn(styles["wallets__item"], {
                    [styles["wallets__item_disabled"]]: !wallet.status,
                  })}
                  onClick={() =>
                    connectBrowserWallet(wallet.name.toLowerCase())
                  }
                >
                  {!wallet.status && (
                    <div className={styles["wallets__errors"]}>
                      Please <strong>turn off</strong>{" "}
                      {isMetaMask ? "MetaMask" : "Coinbase"} extension and{" "}
                      <strong>turn on</strong>{" "}
                      {isMetaMask ? "Coinbase" : "MetaMask"} extension
                    </div>
                  )}
                  <img src={wallet.img} alt={wallet.name} />
                  <h3>{wallet.name}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalMultiplyWallets;
