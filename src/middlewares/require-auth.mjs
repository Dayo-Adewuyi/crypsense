import ErrorHandler from "../utils/errorHandler.mjs";

export const requireAuth = (req, res, next) => {
  if (!req.currentUser) {
    throw new ErrorHandler("Not authorized", 401);
  }

  next();
};
