import User from "../models/userModel.js"
import Post from "../models/postModel.js";
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
import { v2 as cloudinary } from "cloudinary";


//=========================================================== CREATE POST ============================================================

const createPost = async (req,res) => {
    try {
        const {postedBy,text} = req.body;
        let {img} = req.body;
        if(!postedBy || !text) return req.status(400).json({error: "PostedBy & text field is required"})
        
        const user = await User.findById(postedBy)
        if(!user){
            return res.status(404).json({error: "User Not Found"})
        }

        if(user._id.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "Unauthorized to create post"})
        }

        const maxLenght = 500;
        if(text.length > maxLenght){
            return res.status(400).json({error: "Text must be less then 500 charactor"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({postedBy,text,img});
        await newPost.save();
        res.status(201).json(newPost)

    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in createPost: ${error.message}`)
    }
}

//============================================================== GET POST BY ID ========================================================

const getPost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({error: "Post not found"})
        }

        res.status(200).json(post);
        
    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in getPost: ${error.message}`)
    }
}

//============================================================ DELETE POST BY ID =====================================================

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({error: "Post not found"})
        }

        if(post.postedBy.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "Unauthorize to delete post"})
        }

        if(post.img){
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "post deleted successfully"})

    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in deletePost: ${error.message}`)
    }
}

//=========================================================== LIKE OR UNLIKE POST ====================================================

const likeUnlikePost = async (req,res) => {
    try {
        const {id:postId} = req.params;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"})
        }
        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            //Unlike post
            await Post.updateOne({_id:postId}, {$pull: {likes: userId}})
            res.status(200).json({message: "Post unliked successfully"})
        }
        else {
            //like post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({message: "Post liked successfully"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in likeUnlikePost: ${error.message}`)
    }
}


const replyPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;
        
        if(!text){
            return res.status(400).json({error: "Text field is required"})
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"})
        }
        const reply = {userId, text, userProfilePic, username};
        post.replies.push(reply)
        await post.save();
        res.status(200).json(reply)
    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in replyPost: ${error.message}`)
    }
};

//====================================================== GET FEED POSTS =====================================

const getFeedPosts = async (req,res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const following = user.following;

        const feedPosts = await Post.find({postedBy:{$in:following}}).sort({createdAt: -1})
        res.status(200).json(feedPosts);
    } catch (error) {
        res.status(500).json({error: error.message})
        console.error(`Error in getFeedPosts: ${error.message}`)
    }
}

const getUserPosts = async (req,res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username});
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        const posts = await Post.find({postedBy: user._id}).sort({createdAt: -1});
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {createPost, getPost, deletePost, likeUnlikePost, replyPost,getFeedPosts,getUserPosts}