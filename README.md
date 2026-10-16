# ScholarChain — Blockchain-Based Scholarship Management Platform

## Project Overview

ScholarChain is a decentralized scholarship management platform built to improve transparency and accountability in the scholarship distribution process. The platform uses Ethereum smart contracts to manage scholarship creation, funding, student applications, provider approvals, payments, and cancellations with refunds.

By recording important operations on the blockchain, ScholarChain allows transactions to be independently verified, reducing reliance on a purely manual scholarship administration process.

This project was developed as a Web3 blockchain project and deployed to the Ethereum Sepolia test network.

## Problem Statement

Traditional scholarship management can involve manual application processing, limited visibility into decisions, and difficulties tracking scholarship funds and payment status. These challenges can make the process harder to monitor and verify.

ScholarChain explores how blockchain technology and smart contracts can make scholarship operations more transparent, traceable, and accountable.

## Project Objectives

- Develop a smart contract for managing scholarships.
- Enable providers to register and create funded scholarship opportunities.
- Allow students to apply for available scholarships.
- Enable providers to approve applications and pay successful applicants.
- Support scholarship cancellation and refunds.
- Make scholarship transactions verifiable on a public blockchain explorer.

## Key Features

### 1. Provider Registration
Scholarship providers register their wallet addresses through the smart contract before creating scholarships.

### 2. Scholarship Creation and Funding
Registered providers can create scholarships with a title, description, funding amount, application deadline, and maximum number of applicants.

### 3. Student Applications
Students can apply for available scholarships, subject to the scholarship's status, deadline, and applicant limit.

### 4. Application Approval
The provider who created a scholarship can approve eligible applications.

### 5. Scholarship Payments
Providers can release the funded scholarship amount to an approved student through an on-chain transaction.

### 6. Cancellation and Refunds
Providers can cancel active scholarships. The smart contract marks the scholarship inactive and attempts to return its funded amount to the provider.

### 7. Blockchain Verification
Smart contract transactions can be inspected on Sepolia Etherscan.

## Technologies Used

- **Solidity:** Smart contract development.
- **Foundry:** Smart contract compilation and automated testing.
- **React:** Frontend user interface.
- **JavaScript:** Frontend application logic.
- **ethers.js:** Communication between the frontend and Ethereum.
- **MetaMask:** Wallet connection and transaction signing.
- **Ethereum Sepolia:** Smart contract deployment and testing.
- **Git and GitHub:** Version control and source-code hosting.

## System Architecture

ScholarChain consists of three main components:

1. **Frontend:** A React application through which providers and students interact with the platform.
2. **Wallet integration:** MetaMask and ethers.js connect users to the Ethereum network and request transaction signatures.
3. **Smart contract:** The Solidity contract enforces scholarship rules and records scholarship operations on Sepolia.

## Smart Contract Deployment

- **Network:** Ethereum Sepolia Testnet
- **Contract address:** `0x11b759b498994ab8a93edde47f1d139221dd037a`
- **Block explorer:** https://sepolia.etherscan.io/address/0x11b759b498994ab8a93edde47f1d139221dd037a

## Getting Started

### Prerequisites

Install the following tools:

- Git
- Node.js and npm
- Foundry
- MetaMask browser extension

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ScholarChain
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual GitHub repository URL.

### 2. Initialize Dependencies

```bash
git submodule update --init --recursive
```

### 3. Build the Smart Contract

```bash
forge build
```

### 4. Run Smart Contract Tests

```bash
forge test
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

### 6. Connect Your Wallet

- Open MetaMask.
- Switch to the Sepolia test network.
- Connect your wallet to the application.
- Ensure the frontend is configured with the deployed contract address and matching ABI.

Blockchain transactions require Sepolia test ETH for transaction fees.

## Security Considerations

- Never commit private keys, wallet recovery phrases, or secret API credentials.
- Keep environment files and sensitive configuration out of version control.
- Use the Sepolia test network for development and demonstration.
- Conduct a professional security review before using the platform with real funds.

## Limitations

ScholarChain is an educational prototype. Its blockchain deployment uses test ETH and is not a production scholarship service. Additional security auditing, applicant verification, and user-interface improvements would be needed before real-world deployment.

## Future Improvements

- Stronger applicant identity and eligibility verification.
- More comprehensive automated tests and security auditing.
- Improved frontend transaction feedback and automatic status updates.
- Better scholarship search, filtering, and application tracking.
- A production deployment after appropriate testing and review.

## Conclusion

ScholarChain demonstrates how smart contracts can support a transparent and verifiable scholarship management process. By combining a React frontend, wallet integration, and Solidity smart contracts, the project provides a foundation for exploring decentralized scholarship administration.

**Developer:** Orisajo Precious Peter

**Project Category:** Web3 / Blockchain Development

**Deployment Network:** Ethereum Sepolia Testnet