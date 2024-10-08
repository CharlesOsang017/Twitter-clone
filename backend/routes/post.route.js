import express from "express";
import { protectedRoute } from "../middleware/protectRoute.js";
import {
  getFollowingPosts,
  getUserPosts,
  createPost,
  getLikedPosts,
  deletePost,
  getAllPosts,
  commentOnPost,
  likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();
router.post("/create", protectedRoute, createPost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id", protectedRoute, deletePost);
router.get("/all", protectedRoute, getAllPosts);
router.get("/liked/:id", protectedRoute, getLikedPosts);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/user/:username", protectedRoute, getUserPosts);

export default router;
