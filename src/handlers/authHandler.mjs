import { User } from "../model/users.mjs";
import { Password } from "../utils/password.mjs";
import ErrorHandler from "../utils/errorHandler.mjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("Email in use", 400));
  }

  const user = User.build({ email, password });

  await user.save();

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  // Store it on session object

  req.session = {
    jwt: userJwt,
  };

  res.status(201).send(user);
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  const passwordsMatch = await Password.compare(user.password, password);

  if (!passwordsMatch) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  // Store it on session object

  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(user);
};
