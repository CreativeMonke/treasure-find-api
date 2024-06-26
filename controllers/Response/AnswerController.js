import { SECRET_ACCES_TOKEN } from "../../config/index.js";
import Answer from "../../models/Response.js"
import Location from "../../models/Location.js";
import jwt from "jsonwebtoken";
import { evaluateResponse } from "./AiCheck.js";
import { getHuntStartStatus } from "../Hunt/HuntController.js";
import { configManager } from "../GlobalSettingsModule/configManager.js";
import mongoose from "mongoose";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function submitAnswer(req, res) {
    try {
        const { question, answer, locationId } = req.body;
        const userId = req.user._id;

        if (!isValidObjectId(userId) || !isValidObjectId(locationId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid user or location ID format.",
            });
        }
        ///Check to see if the user already responded
        const existingAnswer = await Answer.findOne({
            userId: userId,
            locationId: locationId,
        });
        if (existingAnswer) {
            return res.status(400).json({
                status: "failed",
                message: "You have already submitted an answer for this location!",
            });
        }
        ///Check to see if the location exists
        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({
                status: "failed",
                message: "Location not found!",
            });
        }
        const newAnswer = new Answer({
            question: question,
            answer: answer,
            correctAnswer: location.answer,
            userId: userId,
            locationId: locationId,
        });
        const savedAnswer = await newAnswer.save();
        return res.status(200).json({
            status: "success",
            data: savedAnswer,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function getAnswersByLocationId(req, res) {
    try {
        const { locationId } = req.params;
        if (!isValidObjectId(locationId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid location ID format.",
            });
        }
        const answers = await Answer.find({ locationId: locationId });
        return res.status(200).json({
            status: "success",
            data: answers,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}


export async function getAnswersByUserId(req, res) {
    try {
        // await configManager.loadConfig(); // Ensure config is loaded

        const huntStatus = await getHuntStartStatus();
        const config = configManager.getConfig();
        // Default projection excludes sensitive data
        let excludes = { correctAnswer: 0, evaluationScore: 0 };

        // Check if the hunt has ended and if answers are ready to be shown
        if (huntStatus === 'ended' && config.answersReady) {
            // Include the sensitive data if conditions are met
            excludes = {}; // Removing the projection limitations
        }

        const userId = req.user._id;
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid user ID format.",
            });
        }
        const answers = await Answer.find({ userId: userId }, excludes);

        return res.status(200).json({
            status: "success",
            data: answers,
        });
    } catch (err) {
        console.error('Error fetching user answers:', err);
        return res.status(500).json({
            status: "error",
            data: [err.message],
            message: "Internal Server Error",
        });
    }
}
export async function getNumberOfCorrectAnswers(req, res) {
    try {
        const userId = req.user._id;
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid user ID format.",
            });
        }
        const answers = await Answer.find({ userId: userId });
        let count = 0;
        answers.forEach((answer) => {
            if (answer.isCorrectFinalEvaluation) {
                count++;
            }
        })
        return res.status(200).json({
            status: "success",
            numberOfCorrectAnswers: count,
            numberOfAnswers: answers.length
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
}
export async function getAnswer(req, res) {
    try {
        const { locationId } = req.params;
        const userId = req.user._id;
        if (!isValidObjectId(locationId) || !isValidObjectId(userId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid ID format.",
            });
        }
        const updates = req.body;
        //console.log(updates);
        const allowedUpdated = ["answer", "isValid"];
        const answer = await Answer.findOne({ locationId: locationId, userId: userId });
        if (!answer) {
            return res.status(404).json({
                status: "failed",
                message: "Answer not found!",
            });
        }
        return res.status(200).json({
            status: "success",
            data: answer,
            message: "Answer retrieved successfully!",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }

}

function answerAge(answer) {
    const questionShownAt = new Date(answer.createdAt); // Parse the ISO string to a Date object
    const answerSubmittedAt = new Date(); // Current time as a Date object
    const differenceInSeconds = (answerSubmittedAt - questionShownAt) / 1000;

    return differenceInSeconds;
}

export async function updateAnswerById(req, res) {
    const { answerId } = req.params;
    if (!isValidObjectId(answerId)) {
        return res.status(400).json({
            status: "failed",
            message: "Invalid answer ID format.",
        });
    }
    const updates = req.body;
    //console.log(updates);
    const allowedUpdated = ["answer", "question"];
    const actualUpdated = Object.keys(updates).filter(key => allowedUpdated.includes(key));

    const answer = await Answer.findById(answerId);
    if (!answer) {
        return res.status(404).json({
            status: "failed",
            message: "Answer not found!",
        });
    }
    try {
        if (answer.hasBeenUpdated) {
            return res.status(409).json({
                status: "failed",
                message: "Answer has already been modified!",
            });
        }
        else
            answer.hasBeenUpdated = true;
        const age = answerAge(answer);
        if (age > 5 * 60) // 5 minutes

            return res.status(400).json({//Question is not open for answers
                status: "failed",
                message: "Question is not open for answers!",
            });

        actualUpdated.forEach((key) => {
            answer[key] = updates[key];
        });
        await answer.save();
        res.status(200).json({
            status: "success",
            data: answer,
            message: "Answer updated successfully!",
        });
        ///Create a new entry in correct Answers for each `;` you find
        const correctAnswers = answer.correctAnswer.split(`;`);

        //console.log(correctAnswers);
        answer.evaluationScore = await evaluateResponse(answer.answer, correctAnswers);
        if (answer.evaluationScore >= 80)
            answer.isCorrectFinalEvaluation = true;
        await answer.save();


    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
}

export async function updateAnswerValidity(req, res) {
    try {
        const { answerID } = req.params;
        if (!isValidObjectId(answerID)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid answer ID format.",
            });
        }
        const { isValid } = req.body;
        const answer = await Answer.findById(answerId);
        answer.isValid = isValid;
        const updatedAnswer = await answer.save();
        res.status(200).json({
            status: "success",
            data: updatedAnswer,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function checkAllAnswers(req, res) {
    try {
        const answersToEvaluate = await Answer.find({
            $or: [
                { evaluationScore: { $gte: 60, $lt: 80 }, answer: { $ne: " " } },
                { evaluationScore: -1, answer: { $ne: " " } }
            ]
        });

        for (let answer of answersToEvaluate) {
            if (answer.evaluationScore === -1) {
                const correctAnswers = answer.correctAnswer.split(';');
                answer.evaluationScore = await evaluateResponse(answer.answer, correctAnswers);
            }
            if (answer.evaluationScore >= 80) {
                answer.isCorrectFinalEvaluation = true;
            } else {
                answer.isCorrectFinalEvaluation = false;
            }
            await answer.save();
            await delay(1500);
        }

        return res.status(200).json({
            status: "success",
            message: `Evaluated ${answersToEvaluate.length} answers.`
        });
    } catch (err) {
        console.error('Error evaluating answers:', err);
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            data: err.message
        });
    }
}
