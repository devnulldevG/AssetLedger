import dotenv from 'dotenv';
dotenv.config();

interface OtherParameters {
  [key: string]: any;
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

const validateURL = (url: string): void => {
  try {
    new URL(url);
  } catch (_) {
    throw new ConfigurationError(`${url} is not a valid URL.`);
  }
}

const loadOtherParameters = (): OtherParameters => {
  const reservedKeys = ['BLOCKCHAIN_ENDPOINT', 'API_ADDRESS'];
  return Object.keys(process.env)
    .filter(key => !reservedKeys.includes(key))
    .reduce((obj, key) => {
      if (key && process.env[key]) {
        obj[key] = process.env[key];
      }
      return obj;
    }, <OtherParameters>{});
};

const validateConfig = (config: Config): void => {
  validateURL(config.blockchainEndpoint);
  validateURL(config.apiAddress);
}

const config: Config = {
  blockchainEndpoint: getMandatoryEnvVariable('BLOCKCHAIN_ENDPOINT'),
  apiAddress: getMandatoryEnvVariable('API_ADDRESS'),
  otherParameters: loadOtherParameters(),
};

validateConfig(config);

export default config;