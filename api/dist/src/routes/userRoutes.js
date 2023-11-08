import express from 'express';
import { verifyJWT } from '../middleware/jwt/verifyJWT.js';
import { deleteUser, getFriends, getSingleFriend, updateUser, removeFriend, findUserById, getCurrentUser } from "../controllers/userController.js";
const router = express.Router();
router.use(verifyJWT);
router
    .route("/")
    .get(getCurrentUser)
    .put(updateUser)
    .delete(deleteUser);
router
    .route("/:userId")
    .get(findUserById);
router
    .route("/friends")
    .get(getFriends);
router
    .route("/friends/:friendId")
    .get(getSingleFriend);
router
    .route("/friends/remove/:friendId")
    .delete(removeFriend);
export default router;
