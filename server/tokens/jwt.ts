import jwt from "jsonwebtoken";
// import fs from "fs";
import { IUser } from "../../db/models/user";

const privateKey = process.env.RS256KEY;
const publicKey = process.env.RS256KEYPUB;

if (!privateKey || !publicKey) {
  console.error("No RS256 public/private key found in environment variables");
  process.exit();
}

const signToken = async (user?: IUser): Promise<string | null> => {
  let JWT: string = jwt.sign(user?.toJSON() || {}, privateKey, {
    algorithm: "RS256",
    expiresIn: "2h"
  });

  const verified = await validateToken(JWT);
  if (!verified) return null;
  return JWT;
};

export interface IToken {
  validated: boolean;
}

const validateToken = async (token: string): Promise<boolean> => {
  try {
    jwt.verify(token, publicKey);
    return true;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token expired");
    }
    return false;
  }
};

export { signToken, validateToken };
