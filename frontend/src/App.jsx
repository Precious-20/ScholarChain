import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import "./App.css";
import StudentHome from "./pages/StudentHome";
import ProviderDashboard from "./pages/ProviderDashboard";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config/contract";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [scholarships, setScholarships] = useState([]);

  const [applicationMessage, setApplicationMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentView, setCurrentView] = useState("student");

  function showMessage(message, type = "success") {
    setApplicationMessage(message);
    setMessageType(type);

    setTimeout(() => {
      setApplicationMessage("");
    }, 4000);
  }

  async function loadScholarships(contractInstance, address) {
    if (!contractInstance) return;

    try {
      const count = await contractInstance.scholarshipCount();

      const loadedScholarships = [];

      for (let i = 1; i <= Number(count); i++) {
        const scholarship = await contractInstance.scholarships(i);

        const applicantCount =
          await contractInstance.applicantCount(i);

        let hasApplied = false;
        let application = null;

        if (address) {
          application = await contractInstance.applications(
            i,
            address,
          );

          hasApplied = application.exists === true;
        }

        loadedScholarships.push({
          id: i,
          provider: scholarship.provider,
          title: scholarship.title,
          description: scholarship.description,

          amount: ethers.formatEther(scholarship.amount),

          deadline: new Date(
            Number(scholarship.deadline) * 1000,
          ).toLocaleString(),

          maxApplicants: Number(scholarship.maxApplicants),
          applicantCount: Number(applicantCount),
          active: scholarship.active,

          hasApplied,

          application: application
            ? {
                student: application.student,
                exists: application.exists,
                approved: application.approved,
                paid: application.paid,
              }
            : null,
        });
      }

      setScholarships(loadedScholarships);
    } catch (error) {
      console.error("Error loading scholarships:", error);
      showMessage("Unable to load scholarships.", "error");
    }
  }

  async function connectCurrentWallet() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const provider = new ethers.BrowserProvider(
      window.ethereum,
    );

    const accounts = await provider.send(
      "eth_accounts",
      [],
    );

    if (!accounts || accounts.length === 0) {
      throw new Error("Please connect your MetaMask wallet.");
    }

    const network = await provider.getNetwork();

    if (network.chainId !== 11155111n) {
      throw new Error(
        "Please switch MetaMask to the Sepolia testnet.",
      );
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const scholarshipContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer,
    );

    setWalletAddress(address);
    setContract(scholarshipContract);

    await loadScholarships(
      scholarshipContract,
      address,
    );

    return address;
  }

  async function handleConnectWallet() {
    if (isConnecting) return;

    try {
      setIsConnecting(true);

      const wallet = await connectWallet();

      const scholarshipContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        wallet.signer,
      );

      setWalletAddress(wallet.address);
      setContract(scholarshipContract);

      await loadScholarships(
        scholarshipContract,
        wallet.address,
      );

      showMessage(
        "Wallet connected successfully!",
        "success",
      );
    } catch (error) {
      console.error(error);

      showMessage(
        error.reason ||
          error.shortMessage ||
          error.message ||
          "Unable to connect wallet.",
        "error",
      );
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;

    async function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        setWalletAddress("");
        setContract(null);
        setScholarships([]);
        setCurrentView("student");
        return;
      }

      try {
        setIsConnecting(true);

        await connectCurrentWallet();
      } catch (error) {
        console.error(
          "Error switching wallet account:",
          error,
        );

        setWalletAddress("");
        setContract(null);
        setScholarships([]);

        showMessage(
          error.reason ||
            error.shortMessage ||
            error.message ||
            "Unable to switch wallet account.",
          "error",
        );
      } finally {
        setIsConnecting(false);
      }
    }

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged,
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged,
      );
    };
  }, []);

  async function applyForScholarship(scholarshipId) {
    if (!contract) {
      showMessage(
        "Please connect your wallet first.",
        "error",
      );
      return;
    }

    try {
      showMessage(
        "Submitting application...",
        "success",
      );

      const tx =
        await contract.applyForScholarship(
          scholarshipId,
        );

      await tx.wait();

      showMessage(
        "Application submitted successfully!",
        "success",
      );

      await loadScholarships(
        contract,
        walletAddress,
      );
    } catch (error) {
      console.error(error);

      showMessage(
        error.reason ||
          error.shortMessage ||
          error.message ||
          "Unable to submit application.",
        "error",
      );
    }
  }

  return (
    <div className="app">
      {/* NAVBAR */}

      <nav className="navbar">
        <div
          className="logo"
          onClick={() => setCurrentView("student")}
          style={{ cursor: "pointer" }}
        >
          Scholar<span>Chain</span>
        </div>

        <div className="nav-links">
          <button
            onClick={() => {
              setCurrentView("student");

              setTimeout(() => {
                document
                  .getElementById("scholarships")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }, 0);
            }}
          >
            Scholarships
          </button>

          <button
            onClick={() => {
              setCurrentView("student");

              setTimeout(() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }, 0);
            }}
          >
            About
          </button>

          <button
            onClick={() => setCurrentView("provider")}
          >
            Provider
          </button>
        </div>

        <button
          className={`wallet-button ${
            walletAddress ? "connected" : ""
          }`}
          onClick={handleConnectWallet}
          disabled={isConnecting}
        >
          <span className="wallet-dot"></span>

          {isConnecting
            ? "Connecting..."
            : walletAddress
              ? `${walletAddress.slice(
                  0,
                  6,
                )}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
        </button>
      </nav>

      {/* MAIN CONTENT */}

      {currentView === "student" ? (
        <StudentHome
          walletAddress={walletAddress}
          scholarships={scholarships}
          onConnectWallet={handleConnectWallet}
          onApply={applyForScholarship}
        />
      ) : (
        <ProviderDashboard
  walletAddress={walletAddress}
  contract={contract}
  scholarships={scholarships}
  onRefresh={loadScholarships}
  showMessage={showMessage}
/>
      )}

      {/* MESSAGE */}

      {applicationMessage && (
        <div
          className={`message ${messageType}`}
        >
          {applicationMessage}
        </div>
      )}

      {/* FOOTER */}

      <footer className="footer">
        <strong>
          Scholar<span>Chain</span>
        </strong>

        <p style={{ color: "white" }}>
          Designed by Precious
        </p>

        <p>
          Transparent scholarship distribution powered
          by Ethereum.
        </p>
      </footer>
    </div>
  );
}

export default App;