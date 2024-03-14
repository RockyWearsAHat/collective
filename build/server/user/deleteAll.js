import connectToMongo from '../../db/connectToMongo.js';
import User from '../../db/models/user.js';
import { Router } from 'express';

const router = Router();
const handleDelete = async (_req, res) => {
    try {
        await connectToMongo();
        await User.deleteMany();
        return res.json({ message: "Deleted all users" });
    }
    catch (err) {
        return res.json({ message: "No users to delete" });
    }
};
router.delete("/", handleDelete).post("/", handleDelete);

export { router as default };
//# sourceMappingURL=deleteAll.js.map
