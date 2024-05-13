import { User, IUser } from "../../db/models/user";
import { Request, Response, Router } from "express";
import { checkIfEmail } from "../../helpers/checkIfEmail";

export const registerRouter = Router();

registerRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { username, email, password }: Partial<IUser> = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof email !== "string"
    )
      return res.json({
        message: "Username, email and password must be strings"
      });

    if (
      !username ||
      !password ||
      !email ||
      username.length == 0 ||
      password.length == 0 ||
      email.length == 0
    )
      return res.json({
        message: "Username, email and password must not be empty"
      });

    console.log(checkIfEmail(email));

    if (!checkIfEmail(email)) return res.json({ message: "Invalid email" });

    const newUser = await User.create({ username, email, password });

    return res.json({
      registerRes: newUser
    });
  } catch (err) {
    return res.json({ message: `Error creating user ${err}` });
  }
});
