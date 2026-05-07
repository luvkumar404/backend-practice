import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import cloudinary from '../config/cloudinary.js';
import jsonwebtoken from 'jsonwebtoken';
const router = express.Router();


router.post("/signup", async(req, res) => {
    try {
        console.log("request coming")
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        const uploadImage = await cloudinary.uploader.upload(
            req.files.logoUrl.tempFilePath
        )
        console.log("IMAGE", uploadImage);

        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            channelName: req.body.channelName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashPassword,
            logoUrl: uploadImage.secure_url,
            logoId: uploadImage.public_id
        });

        let user = await newUser.save();
        res.status(201).json({ message: "User created successfully", user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred while signing up user", error: error.message });
    }
})

router.post("/login", async(req, res) => {
    try {
        const existingUser = await User.findOne({
            email: req.body.email
        });

        if(!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValid = await bcrypt.compare(req.body.password, existingUser.password);

        if(!isValid) {
            return res.status(500).json({ message: "Invalid credentials" });
        }

        const token = jsonwebtoken.sign({
            id: existingUser._id,
            channelName: existingUser.channelName,
            email: existingUser.email,
            phone: existingUser.phone,
            logoId: existingUser.logoId,
        }, process.env.JWT_SECRET, { expiresIn: "10d" });

        res.status(200).json({
            id: existingUser._id,
            channelName: existingUser.channelName,
            email: existingUser.email,
            phone: existingUser.phone,
            logoId: existingUser.logoId,   
            token: token,
            subscribers: existingUser.subscribers,
            subscribedChannels: existingUser.subscribedChannels  
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred while logging in user", error: error.message });
        
    }
});

export default router;