const express = require('express');
const router = express.Router();
const Candidate = require('../Models/candidate');
const User = require('../Models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user && user.role === 'admin';
    } catch (err) {
        console.log(err);
        return false;
    }
};

// Post to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'User does not have AdminRole.' });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('Data Saved');
        res.status(200).json({ response: response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Put to update a candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'User does not have AdminRole.' });
        }

        const candidateId = req.params.candidateId;
        const updateCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete a candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'User does not have AdminRole.' });
        }

        const candidateId = req.params.candidateId;
        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    // no admin can vote
    //user can only once vote
  
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
})


router.get('/vote/count',async(req,res)=>{
    try {
        const candidate= await Candidate.find().sort({voteCount:'desc'})

        const Voterecord= candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json(Voterecord);
    } catch (error) {
        
    }
})

module.exports = router;
