import { Router } from "express";
import { registerUser } from "../controllers/membersControllers.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post(
  "/members",
  (req, res, next) => {
    console.log(req.body); // to log text fields
    console.log(req.files); // to log uploaded files
    next();
  },
  upload.fields([
    { name: "proof_of_membership_payment", maxCount: 1 },
    { name: "e_signature", maxCount: 1 },
  ]),
  registerUser
);

export default router;
