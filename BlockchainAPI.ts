import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

interface IToken {
  createToken(name: string, symbol: string): Promise<void>;
  transferToken(to: string, amount: number): Promise<void>;
  getBalance(): Promise<number>;
}

class BlockchainManager implements IToken {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(privateKey: string, rpcURL: string, contractAddress: string, contractABI: any) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcURL);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
  }

  async createToken(name: string, symbol: string): Promise<void> {
    const tx = await this.contract.createToken(name, symbol);
    await tx.wait();
    console.log(`Token created: ${name} (${symbol})`);
  }

  async transferToken(to: string, amount: number): Promise<void> {
    const tx = await this.contract.transfer(to, ethers.utils.parseUnits(amount.toString(), 18));
    await tx.wait();
    console.log(`Transferred ${amount} tokens to ${to}`);
  }

  async getBalance(): Promise<number> {
    const balance = await this.contract.balanceOf(this.wallet.address);
    return ethers.utils.formatUnits(balance, 18);
  }
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY || "";
  const rpcURL = process.env.RPC_URL || "";
  const contractAddress = process.env.CONTRACT_ADDRESS || "";
  const contractABI = JSON.parse(process.env.CONTRACT_ABI || "[]");

  const blockchainManager = new BlockchainManager(privateKey, rpcURL, contractAddress, contractABI);

  await blockchainManager.createToken("MyToken", "MTK");
  await blockchainManager.transferToken("0x000...0001", 100);
  const balance = await blockchainManager.getBalance();
  console.log(`Current balance: ${balance} MTK`);
}

main().catch((error) => {
  console.error("Error occurred:", error);
});