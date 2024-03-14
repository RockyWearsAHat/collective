import connectToMongo from '../../db/connectToMongo.js';
import User from '../../db/models/user.js';
import { Router } from 'express';

const router = Router();
router.post("/", async (req, res) => {
    const { username, password } = req.body;
    if (typeof username !== "string" || typeof password !== "string")
        return res.json({ message: "Username and password must be strings" });
    if (!username || !password || username.length == 0 || password.length == 0)
        return res.json({ message: "Username and password must not be empty" });
    await connectToMongo();
    const newUser = await User.create({ username, password });
    return res.json({
        registerRes: newUser
    });
});

export { router as default };
//# sourceMappingURL=register.js.map
