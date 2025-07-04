import express from "express";
import protectRoute from "../middleware/authMiddleware.js";
import { getUserById, getUsersForSidebar, updateUserStatus, getUserByUsername  } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.put("/status", protectRoute, updateUserStatus);
router.get("/username/:username", protectRoute, getUserByUsername);
router.get("/:id", protectRoute, getUserById);





export default router;