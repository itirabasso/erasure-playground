usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-ganache");
usePlugin("buidler-erasure");

customSetup = require("./src/custom.config");
deploySetup = require("./src/deploy.config");
localSetup = require("./src/local.config");
mainnetSetup = require("./src/mainnet.config");
rinkebySetup = require("./src/rinkeby.config");

module.exports = {
  paths: {},
  solc: {
    evmVersion: "constantinople",
    version: "0.5.13"
  },
  networks: {
    buidlerevm: {
      unlockedAccounts: ["0x9608010323ed882a38ede9211d7691102b4f0ba0"]
    },
    ganache: {
      url: `http://127.0.0.1:7545`,
      gasPrice: 20000000000,
      gasLimit: 6721975,
      defaultBalanceEther: 100,
      totalAccounts: 10,
      hardfork: "petersburg",
      allowUnlimitedContractSize: false,
      locked: false,
      mnemonic: "myth like bonus scare over problem client lizard pioneer submit female collect",
      hdPath: "m/44'/60'/0'/0/",
      unlockedAccounts: ["0x9608010323ed882a38ede9211d7691102b4f0ba0"],
      keepAliveTimeout: 5000,
    },
    develop: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic:
          "myth like bonus scare over problem client lizard pioneer submit female collect",
        path: "m/44'/60'/0'/0/",
        initialIndex: 0,
        count: 20
      }
    },
    mainnet: {
      url: "http://127.0.0.1:8545"
    }
  },
  erasure: {
    setup: {
      buidlerevm: deploySetup,
      ganache: deploySetup,
      develop: deploySetup,
      rinkeby: rinkebySetup,
      mainnet: mainnetSetup,
    }
  }
};
