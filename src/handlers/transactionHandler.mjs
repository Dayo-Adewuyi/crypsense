import { decrypt } from "../utils/encryption.mjs";
import ErrorHandler from "../utils/errorHandler.mjs";
import { User } from "../model/users.mjs";
import connex from "../helpers/connex.mjs";
// import { sendTransaction } from "../helpers/transfer.mjs";
import sendVIP180Transaction from "../helpers/send.cjs";

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
    const transfer = await sendVIP180Transaction(to, amount, decryptKey);

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
