import bcrypt from "bcrypt";
import { Buffer } from "node:buffer";

const hashBase64 = (string) => {
  if (!string) {
    return null;
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(string, salt);
  const base64Hash = Buffer.from(hash).toString("base64");

  return base64Hash;
};

export default hashBase64;
