import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

interface IAssetLedger {
  mintAsset(name: string, symbol: string): Promise<void>;
  transferAsset(toAddress: string, quantity: number): Promise<void>;
  fetchBalance(): Promise<number>;
}

class EthBlockchainManager implements IAssetLedger {
  private readonly smartContract: ethers.Contract;

  constructor(walletPrivateKey: string, rpcEndpointURL: string, smartContractAddress: string, smartContractABI: any) {
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcEndpointURL);
    const blockchainWallet = new ethers.Wallet(walletPrivateKey, jsonRpcProvider);
    this.smartContract = new ethers.Contract(smartContractAddress, smartContractABI, blockchainWallet);
  }

  async mintAsset(assetName: string, assetSymbol: string): Promise<void> {
    try {
      const transaction = await this.smartContract.createToken(assetName, assetSymbol);
      await transaction.wait();
      console.log(`Asset minted: ${assetName} (${assetSymbol})`);
    } catch (error) {
      console.error(`Failed to mint asset: ${assetName} (${assetSymbol}). Error:`, error);
      throw error;
    }
  }

  async transferAsset(toAddress: string, quantity: number): Promise<void> {
    try {
      const transaction = await this.smartContract.transfer(toAddress, ethers.utils.parseUnits(quantity.toString(), 18));
      await transaction.wait();
      console.log(`Transferred ${quantity} assets to ${toAddress}`);
    } catch (error) {
      console.error(`Failed to transfer ${quantity} assets to ${toAddress}. Error:`, error);
      throw error;
    }
  }

  async fetchBalance(): Promise<number> {
    try {
      const balance = await this.smartContract.balanceOf(await this.smartContract.signer.getAddress());
      return parseFloat(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error("Failed to fetch balance. Error:", error);
      throw error;
    }
  }
}

async function main() {
  try {
    const walletPrivateKey = process.env.PRIVATE_KEY || "";
    const rpcEndpointURL = process.env.RPC_URL || "";
    const smartContractAddress = process.env.CONTRACT_ADDRESS || "";
    const smartContractABI = JSON.parse(process.env.CONTRACT_ABI || "[]");

    const assetLedger = new EthBlockchainManager(walletPrivateKey, rpcEndpointURL, smartContractAddress, smartContractABI);

    try {
      await assetLedger.mintAsset("GlobalToken", "GLT");
    } catch (mintError) {
      // Handle mintAsset specific error
    }
    
    try {
      await assetLedger.transferAsset("0x000...0001", 100);
    } catch (transferError) {
      // Handle transferAsset specific error
    }

    try {
      const walletBalance = await assetLedger.fetchBalance();
      console.log(`Current wallet balance: ${walletBalance} GLT`);
    } catch (balanceError) {
      // Handle fetchBalance specific error
    }

  } catch (error) {
    console.error("An unexpected error occurred in the Asset Ledger operations:", error);
  }
}

main();