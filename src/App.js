import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import ModalMultiplyWallets from "./components/ModalMultiplyWallets";
import { DAppContext } from "./context";
import "./styles/index.scss";

function App() {
  const { connectBrowserWallet, loading, isOpen, setIsOpen, userData } =
    useContext(DAppContext);

  return (
    <div className="App">
      {userData && (
        <div className="account">
          <h3>
            Account: {userData?.account.slice(0, 5)}...
            {userData?.account.slice(-4)}
          </h3>
        </div>
      )}
      <button onClick={() => setIsOpen(true)} className="btn">
        <span>Connect Wallet</span>
      </button>
      <ModalMultiplyWallets
        connectBrowserWallet={connectBrowserWallet}
        loading={loading}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
