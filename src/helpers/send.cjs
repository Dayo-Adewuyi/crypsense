const { Framework } = require("@vechain/connex-framework");
const { Driver, SimpleNet } = require("@vechain/connex-driver");
const { Transaction, secp256k1 } = require("thor-devkit");
const bent = require("bent");

// const sendTransaction = async (to, amount, key) => {
//   const net = new SimpleNet("https://testnet.veblocks.net");
//   const driver = await Driver.connect(net);

//   // now we get the ready-to-use Connex instance object
//   const connex = new Framework(driver);

//   const clauses = [
//     {
//       to: to,
//       value: amount.concat("0".repeat(18)),
//       data: "0x",
//     },
//   ];

//   //build transaction
//   const transaction = new Transaction({
//     chainTag: Number.parseInt(connex.thor.genesis.id.slice(-2), 16),
//     blockRef: connex.thor.status.head.id.slice(0, 18),
//     expiration: 32,
//     clauses: clauses,
//     gas: connex.thor.genesis.gasLimit,
//     gasPriceCoef: 128,
//     dependsOn: null,
//     nonce: Math.ceil(Math.random() * 1000000000),
//   });

//   // build hex encoded version of the transaction for signing request

//   const rawTransaction = `0x${transaction.encode().toString("hex")}`;

//   // sign transaction with the known private key

//   const signingHash = transaction.signingHash();
//   const originSignature = secp256k1.sign(
//     signingHash,
//     Buffer.from(key.slice(2), "hex")
//   );

//   // build combined signature from both parties

//   transaction.signature = originSignature;

//   // post transaction to node

//   const post = bent("POST", "https://testnet.veblocks.net", "json");
//   const signedTransaction = `0x${transaction.encode().toString("hex")}`;
//   const { id } = await post("/transactions", { raw: signedTransaction });

//   return id;
// };

const sendVIP180Transaction = async (to, amount, key) => {
  try {
    const net = new SimpleNet("https://testnet.veblocks.net");
    const driver = await Driver.connect(net);

    // now we get the ready-to-use Connex instance object
    const connex = new Framework(driver);

    const contractAddress = "0xe1279f6fE4188E34B01f2783Cfb9A8C4c82cD80D";
    const transferABI = {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    };

    const contract = connex.thor.account(contractAddress);
    const transfer = contract.method(transferABI);
    const clauses = [transfer.asClause(to, amount.concat("0".repeat(18)))];
    const transaction = new Transaction({
      chainTag: Number.parseInt(connex.thor.genesis.id.slice(-2), 16),
      blockRef: connex.thor.status.head.id.slice(0, 18),
      expiration: 32,
      clauses: clauses,
      gas: connex.thor.genesis.gasLimit,
      gasPriceCoef: 128,
      dependsOn: null,
      nonce: Math.ceil(Math.random() * 1000000000),
    });

    // build hex encoded version of the transaction for signing request

    const rawTransaction = `0x${transaction.encode().toString("hex")}`;

    // sign transaction with the known private key

    const signingHash = transaction.signingHash();

    const originSignature = secp256k1.sign(
      signingHash,
      Buffer.from(key.slice(2), "hex")
    );

    // build combined signature from both parties

    transaction.signature = originSignature;

    // post transaction to node

    const post = bent("POST", "https://testnet.veblocks.net", "json");
    const signedTransaction = `0x${transaction.encode().toString("hex")}`;
    const { id } = await post("/transactions", { raw: signedTransaction });

    return id;
  } catch (e) {
    console.log(e);
  }
};

module.exports = sendVIP180Transaction;
