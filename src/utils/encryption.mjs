import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, "salt", 32);

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    key,
    iv
  );

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    key,
    iv
  );
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString();
};
