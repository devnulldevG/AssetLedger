import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

interface IAssetLedger {
  mintAsset(name: string, symbol: string): Promise<void>;
  transferAsset(toAddress: string, quantity: number): Promise<void>;
  fetchBalance(): Promise<number>;
}

class EthBlockchainManager implements IAssetLedger {
  private jsonRpcProvider: ethers.providers.JsonRpcProvider;
  private blockchainWallet: ethers.Wallet;
  private smartContract: ethers.Contract;

  constructor(walletPrivateKey: string, rpcEndpointURL: string, smartContractAddress: string, smartContractABI: any) {
    this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcEndpointURL);
    this.blockchainWallet = new ethers.Wallet(walletPrivateKey, this.jsonRpcProvider);
    this.smartContract = new ethers.Contract(smartContractAddress, smartContractABI, this.blockchainWallet);
  }

  async mintAsset(assetName: string, assetSymbol: string): Promise<void> {
    const transaction = await this.smartContract.createToken(assetName, assetSymbol);
    await transaction.wait();
    console.log(`Asset minted: ${assetName} (${assetSymbol})`);
  }

  async transferAsset(toAddress: string, quantity: number): Promise<void> {
    const transaction = await this.smartContract.transfer(toAddress, ethers.utils.parseUnits(quantity.toString(), 18));
    await transaction.wait();
    console.log(`Transferred ${quantity} assets to ${toAddress}`);
  }

  async fetchBalance(): Promise<number> {
    const balance = await this.smartContract.balanceOf(this.blockchainWallet.address);
    return parseFloat(ethers.utils.formatUnits(balance, 18));
  }
}

async function main() {
  const walletPrivateKey = process.env.PRIVATE_KEY || "";
  const rpcEndpointURL = process.env.RPC_URL || "";
  const smartContractAddress = process.env.CONTRACT_ADDRESS || "";
  const smartContractABI = JSON.parse(process.env.CONTRACT_ABI || "[]");

  const assetLedger = new EthBlockchainManager(walletPrivateKey, rpcEndpointURL, smartContractAddress, smartContractABI);

  await assetLedger.mintAsset("GlobalToken", "GLT");
  await assetLedger.transferAsset("0x000...0001", 100);
  const walletBalance = await assetLedger.fetchBalance();
  console.log(`Current wallet balance: ${walletBalance} GLT`);
}

main().catch((error) => {
  console.error("Error occurred in Asset Ledger operations:", error);
});