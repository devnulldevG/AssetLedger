import dotenv from 'dotenv';

dotenv.config();

interface Config {
  blockchainEndpoint: string;
  apiAddress: string;
  otherParameters: {
    [key: string]: string | undefined;
  };
}

const config: Config = {
  blockchainEndpoint: process.env.BLOCKCHAIN_ENDPOINT || 'defaultBlockchainEndpoint',
  apiAddress: process.env.API_ADDRESS || 'defaultApiAddress',
  otherParameters: {
  }
};

export default config;