import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();

  if (network.chainId !== 11155111n) {
    throw new Error("Please switch MetaMask to the Sepolia testnet.");
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}
