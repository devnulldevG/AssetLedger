import dotenv from 'dotenv';
dotenv.config();

interface OtherParameters {
  [key: string]: string | undefined;
}

interface Config {
  blockchainEndpoint: string;
  apiAddress: string;
  otherParameters: OtherParameters;
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(`Configuration Error: ${message}`);
    this.name = 'ConfigurationError';
  }
}

const getMandatoryEnvVariable = (varName: string): string => {
  const value = process.env[varName];
  if (!value) {
    throw new ConfigurationError(`${varName} is a required environment variable, but it was not provided.`);
  }
  return value;
};

const config: Config = {
  blockchainEndpoint: getMandatoryEnvVariable('BLOCKCHAIN_ENDPOINT'),
  apiAddress: getMandatoryEnvVariable('API_ADDRESS'),
  otherParameters: {
  },
};

export default config;