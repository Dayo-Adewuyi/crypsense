import { validationResult } from "express-validator";
import ErrorHandler from "../utils/errorHandler.mjs";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ErrorHandler("validation error", 400);
  }

  next();
};
