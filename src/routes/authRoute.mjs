import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request.mjs";
import { requireAuth } from "../middlewares/require-auth.mjs";
import { signup, signin } from "../handlers/authHandler.mjs";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  signup
);

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  signin
);

router.get("/api/users/currentuser", requireAuth, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as authRouter };
