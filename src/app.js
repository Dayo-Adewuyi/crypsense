import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import morgan from "morgan";
import { currentUser } from "./middlewares/current-user.mjs";
import error from "./middlewares/error.mjs";
import { xss } from "./middlewares/xss-clean.mjs";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import mongoose from "mongoose";
import ErrorHandler from "./utils/errorHandler.mjs";
import { authRouter } from "./routes/authRoute.mjs";
import { transactionRouter } from "./routes/transactionRoute.mjs";

const app = express();

dotenv.config();

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URI must be defined");
  }

  if (!process.env.ENCRYPTION_SECRET) {
    throw new Error("ENCRYPTION_KEY must be defined");
  }

  if (!process.env.ENCRYPTION_ALGORITHM) {
    throw new Error("ENCRYPTION_ALGORITHM must be defined");
  }
  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }
};

start();

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down due to uncaught exception.");
  process.exit(1);
});

app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use(cors());

app.use(xss());
app.use(hpp());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(mongoSanitize());

app.use(currentUser);
app.use(authRouter);
app.use(transactionRouter);
app.use(morgan("combined"));

app.all("*", async (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

app.use(error);

app.listen(8080, () => {
  console.log("crypsense-backend reporting for duty!");
});

// Handling Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled promise rejection.");
  server.close(() => {
    process.exit(1);
  });
});
