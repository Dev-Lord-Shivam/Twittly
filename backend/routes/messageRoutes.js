import express from 'express';
import { sendMessage,getMessage, getConversation } from '../controllers/messageController.js';
import Authorize from '../middlewares/Authorize.js';

const router = express.Router();

router.get("/conversations",Authorize,getConversation);
router.get("/:otherUserId",Authorize,getMessage);
router.post("/",Authorize,sendMessage);



export default router   