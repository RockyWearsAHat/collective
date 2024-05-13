import jwt from "jsonwebtoken";
// import fs from "fs";
import { IUser } from "../../db/models/user";

const privateKey = "placeholderForNowRS256IsComingSoon";
// fs.readFileSync(`${process.cwd()}/server/tokens/RS256.key`) ||
// process.env.RS256KEY;
// const publicKey =
//   fs.readFileSync(`${process.cwd()}/server/tokens/RS256.key.pub`) ||
//   process.env.RS256KEYPUB;

const signToken = async (user?: IUser): Promise<string | null> => {
  let JWT: string = jwt.sign(user?.toJSON() || {}, privateKey, {
    // algorithm: "RS256",
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
    // jwt.verify(token, publicKey);
    jwt.verify(token, privateKey);
    return true;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token expired");
    }
    return false;
  }
};

export { signToken, validateToken };
