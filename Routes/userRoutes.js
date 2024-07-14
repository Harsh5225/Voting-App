const express = require('express');
const router = express.Router();
const User = require('../Models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

router.post('/SignUp', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data);
        // check 
        const response = await newUser.save();
        console.log('Data Saved');

        const payload = { id: response.id };
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        console.log("Token is :", token);
        res.status(200).json({ response: response, token: token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        if (!user || !await user.comparePassword(password)) {
            return res.status(401).json({ error: 'Invalid username or Password' });
        }

        const payload = { id: user.id };
        const token = generateToken(payload);
        res.json({ token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/Profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put('/Profile/Password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!await user.comparePassword(currentPassword)) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();
        console.log('Password Updated');
        res.status(200).json({ message: "Password Updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
