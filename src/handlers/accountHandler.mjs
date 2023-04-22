import { ethers } from "ethers";
import * as bip39 from "bip39";
import { encrypt, decrypt } from "../utils/encryption.mjs";

import ErrorHandler from "../utils/errorHandler.mjs";
import { User } from "../model/users.mjs";

export const createAccount = async (req, res, next) => {
  const mnemonic = bip39.generateMnemonic();
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  if (!wallet) {
    return next(new ErrorHandler("Error creating account", 400));
  }

  const user = await User.findOneAndUpdate(
    { email: req.currentUser.email },
    { publicKey: wallet.address },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler("Error creating account", 400));
  }

  res.status(201).send({
    mnemonic: encrypt(mnemonic),
    address: wallet.address,
    privateKey: encrypt(wallet.privateKey),
  });
};

export const importAccount = async (req, res, next) => {
  const { mnemonic } = req.body;
  const decryptKey = decrypt(mnemonic);
  const wallet = ethers.Wallet.fromMnemonic(decryptKey);

  if (!wallet) {
    return next(new ErrorHandler("Error importing account", 400));
  }

  const user = await User.findOneAndUpdate(
    { email: req.currentUser.email },
    { publicKey: wallet.address },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler("Error importing account", 400));
  }

  res.status(201).send({
    mnemonic: encrypt(mnemonic),
    address: wallet.address,
    privateKey: encrypt(wallet.privateKey),
  });
};
