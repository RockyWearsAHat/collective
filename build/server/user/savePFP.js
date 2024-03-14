import { Router } from 'express';
import multer from 'multer';

const router = Router();
const generateFileName = (file) => {
    return `${Date.now()}-${file.originalname}`;
};
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (_req, file, cb) => {
        cb(null, generateFileName(file));
    }
});
const uploadFile = multer({ storage: storage });
const savePFP = async (req, res) => {
    let file = req.file;
    console.log(file);
    return res.json({ message: "PFP saved" });
};
router.post("/", uploadFile.single("newPFP"), savePFP);

export { router as default };
//# sourceMappingURL=savePFP.js.map
