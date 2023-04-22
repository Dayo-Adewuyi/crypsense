import express from "express";
import { body, param } from "express-validator";
import { validateRequest } from "../middlewares/validate-request.mjs";
import { requireAuth } from "../middlewares/require-auth.mjs";
import {
  transferToken,
  getTokenBalance,
} from "../handlers/transactionHandler.mjs";
import { createAccount, importAccount } from "../handlers/accountHandler.mjs";

const router = express.Router();

router.post(
  "/api/transaction/transfer",
  [
    body("to").isString().withMessage("receiving account must be valid"),
    body("amount").trim().isString().withMessage("Amount must be valid"),
    body("key").trim().isString().withMessage("Private key must be valid"),

    body("from").trim().isString().withMessage("From must be valid"),
  ],
  validateRequest,
  requireAuth,
  transferToken
);

router.get("/api/account/create", requireAuth, createAccount);

router.post(
  "/api/account/import",
  [
    body("mnemonic")
      .trim()
      .isString()
      .withMessage("mnemonic key must be valid"),
  ],
  validateRequest,
  requireAuth,
  importAccount
);

router.get(
  "/api/account/balance/:address",
  [param("address").isString().withMessage("address must be valid")],
  requireAuth,
  getTokenBalance
);

export { router as transactionRouter };
