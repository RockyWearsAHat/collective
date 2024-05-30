import jwt from "jsonwebtoken";
// import fs from "fs";
import { IUser } from "../../db/models/user";

let privateKey: string | null = null,
  publicKey: string | null = null;

const getKeys = async (): Promise<{
  rtnPrivateKey: string;
  rtnPublicKey: string;
}> => {
  const privateKeyRes = await fetch(
    `${process.env.GITHUB_KEY_REPO}/RS256.key`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_READ_TOKEN}`
      }
    }
  );
  const publicKeyRes = await fetch(
    `${process.env.GITHUB_KEY_REPO}/RS256.key.pub`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_READ_TOKEN}`
      }
    }
  );

  if (!privateKeyRes || !publicKeyRes) {
    console.error("Error fetching keys");
    process.exit();
  }

  const rtnPrivateKey = await privateKeyRes.text();
  const rtnPublicKey = await publicKeyRes.text();

  return { rtnPrivateKey, rtnPublicKey };
};

const signToken = async (user?: IUser): Promise<string | null> => {
  if (!publicKey || !privateKey) {
    const { rtnPrivateKey, rtnPublicKey } = await getKeys();
    publicKey = rtnPublicKey;
    privateKey = rtnPrivateKey;
  }

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
    if (!publicKey || !privateKey) {
      const { rtnPrivateKey, rtnPublicKey } = await getKeys();
      publicKey = rtnPublicKey;
      privateKey = rtnPrivateKey;
    }

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
