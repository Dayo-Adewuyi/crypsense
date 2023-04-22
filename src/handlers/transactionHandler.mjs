import { Framework } from "@vechain/connex-framework";
import { Driver, SimpleNet } from "@vechain/connex-driver";
import { decrypt } from "../utils/encryption.mjs";
import ErrorHandler from "../utils/errorHandler.mjs";
import { User } from "../model/users.mjs";

const net = new SimpleNet("https://testnet.veblocks.net");
const driver = await Driver.connect(net);

// now we get the ready-to-use Connex instance object
const connex = new Framework(driver);

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

const balanceABI = {
  inputs: [
    {
      internalType: "address",
      name: "account",
      type: "address",
    },
  ],
  name: "balanceOf",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const contractAddress = "0xe1279f6fE4188E34B01f2783Cfb9A8C4c82cD80D";

// get token balance of an account
export const transferToken = async (req, res, next) => {
  const { from, to, amount, key } = req.body;

  try {
    const findAccount = await User.findOne({
      publicKey: from,
      _id: req.currentUser.id,
    });

    if (!findAccount) {
      return next(new ErrorHandler("Account not found", 400));
    }

    const decryptKey = decrypt(key);

    const transferMethod = connex.thor
      .account(contractAddress)
      .method(transferABI);

    const transfer = await connex.vendor
      .sign("tx", {
        from: from,
        to: to,
        value: amount,
        data: "0x",
        gas: 1000000,
        gasPrice: 1000000000,
      })
      .signer(decryptKey)
      .request();

    res.status(201).send({
      transfer,
    });
  } catch (err) {
    return next(new ErrorHandler(err, 400));
  }
};

export const getTokenBalance = async (req, res, next) => {
  const { address } = req.params;

  try {
    const balance = await connex.thor
      .account(contractAddress)
      .method(balanceABI)
      .call(address);

    res.status(201).send({
      balance: balance.decoded[0],
    });
  } catch (err) {
    return next(new ErrorHandler(err, 400));
  }
};
