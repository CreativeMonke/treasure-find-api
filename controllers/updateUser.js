import User from "../models/User.js"
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";
export async function updateUser(req, res) {
    try {
        const userId = req.user._id;
        const updates = req.body;

        const allowedUpdates = ["first_name", "last_name", "team", "town"];
        const actualUpdates = Object.keys(updates).filter(key => allowedUpdates.includes(key));

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found!",
            });
        }

        actualUpdates.forEach((update) => {
            if (user[update] !== undefined) { // Make sure the update property exists on the user
                user[update] = updates[update];
            } else {
                throw new Error(`Attempt to update non-existing property: ${update}`);
            }
        });

        await user.save();

        const { password, ...updatedUserData } = user._doc;
        res.status(200).json({
            status: "succes",
            data: updatedUserData,
            message: "User data changed succesfully!",
        });
    } catch (err) {
        console.error("Error updating user:", err.message);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function startHunt(req, res) {
    try {
        const user = await User.findById(req.user._id);
        user.huntState.hasStartedHunt = true;
        await user.save();
        res.status(200).json({
            status: "succes",
            message: "Hunt started succesfully!",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}
export async function endHunt(req, res) {
    try {
        const user = await User.findById(req.user._id);
        user.huntState.hasEndedHunt = true;
        await user.save();
        res.status(200).json({
            status: "succes",
            message: "Hunt ended!",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}
export async function editUserById(req, res) {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const allowedUpdates = ["first_name", "last_name", "town", "role" , "password"];
        const actualUpdates = Object.keys(updates).filter(key => allowedUpdates.includes(key));
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found!",
            });
        }
        actualUpdates.forEach((update) => {
            user[update] = updates[update];
        });
        await user.save();
        const { password, ...updatedUserData } = user._doc;
        res.status(200).json({
            status: "succes",
            data: updatedUserData,
            message: "User data changed succesfully!",
        });
    } catch (evt) {
        console.error(evt);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await User.find();
        ///omit password field
        const usersData = users.map((user) => user._doc);
        res.status(200).json({
            status: "success",
            data: usersData,
            message: "Users fetched successfully!",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

