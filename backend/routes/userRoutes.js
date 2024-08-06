import express from 'express';
import Authorize from '../middlewares/Authorize.js';
import {signupUser,loginUser,logoutUser,followUnfollowUser, updateUser, getUserProfile, getSuggestedUsers,getSearchedUser} from '../controllers/userController.js';
const router = express.Router();

router.get("/profile/:query",getUserProfile)
router.get("/SearchUser",getSearchedUser)
router.get("/suggested",Authorize,getSuggestedUsers)
router.post("/signup", signupUser);
router.post("/login",loginUser);
router.post("/logout",logoutUser);
router.post("/follow/:id", Authorize ,followUnfollowUser);
router.put("/update/:id", Authorize ,updateUser);


export default router;