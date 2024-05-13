import { User, IUser } from "../../db/models/user";
import { Request, Response, Router } from "express";
import { signToken, validateToken } from "../tokens/jwt";
import { checkIfEmail } from "../../helpers/checkIfEmail";
import { getUserPFP } from "../helpers/s3";

export const loginRouter = Router();

loginRouter.post("/", async function (req: Request, res: Response) {
  let { username, password }: Partial<IUser> = req.body;

  //Validate input
  if (typeof username !== "string" || typeof password !== "string")
    return res.json({ error: "Username and password must be strings" });

  if (!username || !password || username.length == 0 || password.length == 0)
    return res.json({ error: "Username and password must not be empty" });

  //Get user from DB
  let searchQuery = {};
  if (checkIfEmail(username)) searchQuery = { email: username };
  else searchQuery = { username };
  const foundUser = await User.findOne<IUser>(searchQuery);

  //Handle errors (user not found)
  if (!foundUser)
    return res.json({
      error: `Unable to find user ${username}`
    });

  //Verify the user entered the right info
  const passwordsMatch: boolean = foundUser.verifyPassword(password);

  //If not, throw error, !passwordsMatch ensures that passwordsMatch is not undefined, passwordsMatch !== true ensures that passwordsMatch is not false
  if (!passwordsMatch || passwordsMatch !== true)
    return res.json({ error: "Invalid password" });

  //If login valid, sign a token and set it in a cookie
  const token: string | null = await signToken(foundUser);
  if (!token) {
    return res.json({ error: "Error signing token, please try again" });
  } else if (!validateToken(token)) {
    return res.json({ error: "Error validating token, please try again" });
  }

  const user = foundUser.toJSON();

  req.session.token = token;
  req.session.user = user;
  req.session.save();

  if (user.pfpId) {
    const link = await getUserPFP(foundUser._id);

    if (typeof link == "string") {
      req.session.userPFP = link;
      req.session.save();
    } else {
      return res.json({ error: "Error getting user PFP" });
    }
  }

  // ("token", token, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "none",
  //   maxAge: 5 * 1000,
  //   expires: new Date(Date.now() + 5 * 1000)
  // });

  //If so, assemble object to return and send it
  const returnObj: {
    loggedIn: boolean;
    username: string;
  } = {
    loggedIn: true,
    username: foundUser.username
  };

  return res.json(returnObj);
});
