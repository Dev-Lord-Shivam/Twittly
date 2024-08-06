import express from 'express';
import Authorize from '../middlewares/Authorize.js';
import { createPost, getPost, deletePost, likeUnlikePost, replyPost, getFeedPosts,getUserPosts } from '../controllers/postController.js';

const router = express.Router();

router.get("/feed",Authorize,getFeedPosts);
router.get("/:id",getPost);
router.get("/user/:username",getUserPosts);
router.post("/create",Authorize,createPost);
router.delete("/:id",Authorize,deletePost)
router.put("/like/:id",Authorize,likeUnlikePost);
router.put("/reply/:id",Authorize,replyPost);

export default router