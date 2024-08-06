import User from "../models/userModel.js"
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
import {v2 as cloudinary} from 'cloudinary'
import mongoose from "mongoose";
import Post from "../models/postModel.js";

//================================================= Register a User ===========================================================//


const signupUser = async(req,res) => {
    try {
        const {name,email,username,password} = req.body;
        const user = await User.findOne({$or:[{email},{username}]});
        if(user){
            return res.status(400).json({error:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });
        await newUser.save();

        if(newUser){
            generateTokenAndSetCookies(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({error: "Invalid User Data"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in signupUser: ${error.message}`)
    }
}

//====================================================== login user ===========================================================//

const loginUser = async(req,res) => {
   try {
    const {username,password} = req.body;
    const user = await User.findOne({username});
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    if(!user || !isPasswordCorrect) return res.status(400).json({error: "Invalid username or password"})
    
    generateTokenAndSetCookies(user._id,res);

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
    });
     
   } catch (error) {
      res.status(500).json({error: error.message})
      console.log(`Error in loginUser: ${error.message}`)
   }
}

//======================================================== LogOut user ================================================================//

const logoutUser = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:1});
        res.status(200).json({message: "User logged out successfully"});
    } catch (error) {
      res.status(500).json({error: error.message})
      console.log(`Error in logOutUser: ${error.message}`)
    }
}

//===================================================== Follow & Unfollow Users =========================================================//

const followUnfollowUser = async (req,res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()) return res.status(400).json({error: "You cannot follow/unfollow yourself"})
        
        if(!userToModify || !currentUser) res.status(400).json({error: "User Not Found"})

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow user
           await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
           await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
           res.status(200).json({message: "User unfollowed successfully"})
        }
        else {
           //follow user
           await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
           await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
           res.status(200).json({message: "User followed successfully"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
        console.log(`Error in followUnfollowUser: ${error.message}`)
    }
}

//========================================================= Update User Profile ========================================================//

const updateUser = async (req, res) => {
    const {name,email,username,password, bio} = req.body;
    let {profilePic} = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if(!user) return res.status(400).json({error: "User not found"});
         
        if(req.params.id !== userId.toString()) return res.status(400).json({error: "Cannot Update profile of other user"});

        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);
            user.password = hashedPassword;
        }
        
        if(profilePic){
            if(user.profilePic){
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        //Find all posts that this user replies and update username & userProfilePic fields
        await Post.updateMany(
            {"replies.userId":userId},
            {
                $set:{
                    "replies.$[reply].username":user.username,
                    "replies.$[reply].userProfilePic":user.profilePic
                },
            },
            {arrayFilters:[{"reply.userId":userId}]}
        );

        user.password = null; //password should be null in response
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({error: error.message})
        console.log(`Error in updateUser: ${error.message}`)
    }
}

const getUserProfile = async(req, res) => {
    try {
        const {query} = req.params;
        let user;
        //query is userId
        if(mongoose.Types.ObjectId.isValid(query)){
           user = await User.findOne({_id: query}).select("-password").select("-updatedAt");   
        }
        else {
            user = await User.findOne({username:query}).select("-password").select("-updatedAt");   
        }
        // const user = await User.findOne({username}).select("-password").select("-updatedAt");
        if(!user) return res.status(200).json({error: "User Not Found"});

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({error: error.message})
        console.log(`Error in getUserProfile: ${error.message}`)
    }
}

const getSuggestedUsers = async (req,res) => {
    try {
        const userId = req.user._id;
        const userFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId},
                }
            },
            {
                $sample:{size:10}
            }
        ])
        const filteredUsers = users.filter(user => !userFollowedByYou.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,5)
        suggestedUsers.forEach(user => user.password = null)
        res.status(200).json(suggestedUsers)
    } catch (error) {
        res.status(500).json({error: error.message})
        console.log(`Error in getSuggestedUsers: ${error.message}`)
    }
}


const getSearchedUser = async (req,res) => {
    const query = req.query.q;
    try {
        const users = await User.find({
            name: new RegExp(`^${query}`, 'i') // The caret (^) anchors the pattern to the start of the string
        }).select("-password").limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({error: error.message})
        console.log(`Error in getSearchedUser: ${error.message}`)
    }
}

export {signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile,getSuggestedUsers,getSearchedUser};