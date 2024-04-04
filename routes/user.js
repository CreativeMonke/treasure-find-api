import { check } from "express-validator";
import express from "express";
import { Verify, VerifyRole } from "../middleware/verify.js";
import { getAllUsers, updateUser , editUserById} from "../controllers/updateUser.js";
import { validateUpdate } from "../middleware/update.js";
const router = express.Router();
router.put(
    "/edit",
    check('first_name')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 25 })
        .withMessage('Your first name must be between 2 and 25 characters.'),
    check('last_name')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 25 })
        .withMessage('Your last name must be between 2 and 25 characters.'),
    check('town')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 20 })
        .withMessage('Your town must be between 2 and 20 characters.'),
    Verify,
    validateUpdate,
    updateUser,
)
router.put(
    "/edit/:userId",
    check('first_name')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 25 })
        .withMessage('The name must be between 2 and 25 characters.'),
    check('last_name')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 25 })
        .withMessage('The name must be between 2 and 25 characters.'),
    check('town')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 20 })
        .withMessage('The town name must be between 2 and 20 characters.'),
    Verify,
    VerifyRole,
    validateUpdate,
    editUserById,
)
router.get("/getAll", Verify, VerifyRole, getAllUsers);

export default router;