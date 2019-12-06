usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-ganache");
usePlugin("buidler-erasure");


// const env = require("@nomiclabs/buidler");

const { ethers, utils } = require("ethers");

const hexlify = utf8str => utils.hexlify(utils.toUtf8Bytes(utf8str));

const createMultihashSha256 = string => {
  const hash = utils.sha256(utils.toUtf8Bytes(string));
  const sha2_256 = "0x12"; // uint8
  const bits256 = utils.hexlify(32);
  const multihash = sha2_256 + bits256.substr(2) + hash.substr(2);

  return multihash;
};

function createSelector(functionName, abiTypes) {
  const joinedTypes = abiTypes.join(",");
  const functionSignature = `${functionName}(${joinedTypes})`;

  const selector = utils.hexDataSlice(
    utils.keccak256(utils.toUtf8Bytes(functionSignature)),
    0,
    4
  );
  return selector;
}

const createIPFShash = string => {
  const hash = utils.sha256(utils.toUtf8Bytes(string));
  const sha2_256 = "0x12"; // uint8
  const bits256 = utils.hexlify(32);
  const multihash = sha2_256 + bits256.substr(2) + hash.substr(2);

  return multihash;
};

task('erasure-play', async (_, env) => {
  const { run, erasure, ethers, config } = env;
  const [deployer, operator, staker, counterparty] = await ethers.signers();

  const contracts = await run("erasure:erasure-setup");
  const nmr = contracts["MockNMR"];

  await nmr.mintMockTokens(await deployer.getAddress(), 1000);
  await nmr.mintMockTokens(await operator.getAddress(), 1000);
  await nmr.mintMockTokens(await staker.getAddress(), 1000);
  await nmr.mintMockTokens(await counterparty.getAddress(), 1000);

  // await nmr.connect(staker).allowance(operator, 100);

  const multihash = createMultihashSha256("multihash");
  const hash = utils.keccak256(hexlify("multihash"));

  const proofhash = utils.sha256(utils.toUtf8Bytes("proofhash"));
  const IPFShash = createIPFShash("multihash");

  console.log("creating instance");

  // const tem = contracts['Feed']
  // const reg = contracts['Erasure_Posts']
  // const fac = contracts['Feed_Factory']

  // const feed = await erasure._createInstance(
  //   tem,
  //   fac.connect(operator),
  //   ["address", "bytes32", "bytes"],
  //   [await operator.getAddress(), proofhash, IPFShash]
  // );

  const feed = await erasure.createInstance(
    "Feed",
    ["address", "bytes32", "bytes"],
    [await operator.getAddress(), proofhash, IPFShash]
  );

  console.log("instance created, submiting hash");
  let tx = await feed.submitHash(hash);
  let receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  if (receipt.logs !== undefined) {
    const log = receipt.logs[0];
    receivedHash = feed.interface.parseLog(log).values.hash;
    if (hash !== receivedHash) {
      console.error(hash, receivedHash, "are different");
    }
  } else {
    console.error("no logs");
  }
  console.log("hash submitted, creating agreement");
  const agreement = await erasure.createAgreement(
    operator,
    staker,
    counterparty,
    1,
    2,
    undefined,
    "0x00"
  );

  await nmr.connect(staker).approve(await operator.getAddress(), 100);
  await nmr.connect(staker).approve(agreement.address, 100);
  tx = await agreement.connect(staker).increaseStake(utils.bigNumberify(1));
  receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  console.log(agreement.interface.parseLog(receipt.logs[0]))
  // receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  // console.log(agreement.interface.parseLog(receipt.logs[0]))
})

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
