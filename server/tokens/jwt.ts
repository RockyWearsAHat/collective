import jwt from "jsonwebtoken";
// import fs from "fs";
import { IUser } from "../../db/models/user";

const privateKey = `${process.env.RS256KEY1}${process.env.RS256KEY2}${process.env.RS256KEY3}${process.env.RS256KEY4}${process.env.RS256KEY5}${process.env.RS256KEY6}${process.env.RS256KEY7}${process.env.RS256KEY8}${process.env.RS256KEY9}${process.env.RS256KEY10}${process.env.RS256KEY11}${process.env.RS256KEY12}${process.env.RS256KEY13}`;
const publicKey = `${process.env.RS256KEYPUB1}${process.env.RS256KEYPUB2}${process.env.RS256KEYPUB3}${process.env.RS256KEYPUB4}`;

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
