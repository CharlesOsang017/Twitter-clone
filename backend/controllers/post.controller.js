import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body; // Image can be null or undefined
    const userId = req.user._id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate that the post has either text or image
    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    // Upload the image only if it's provided
    let imgUrl;
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      imgUrl = uploadResponse.secure_url; // Use the uploaded image URL
    }

    // Create new post
    const newPost = new Post({
      user: userId,
      text,
      img: imgUrl || null, // Set img to null if no image is provided
    });

    // Save post
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    // Fetch the post
    const post = await Post.findById(req.params.id); // Add 'await' to resolve the promise
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user is authorized to delete the post
    if (!post.user.equals(req.user._id)) {
      // Use .equals() to compare ObjectIds
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // Delete image from Cloudinary if it exists
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0]; // Extract Cloudinary image ID
      await cloudinary.uploader.destroy(imgId);
    }

    // Delete the post from the database
    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "textfield is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.log("error in commentOnPost controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id; // Use req.params.id directly

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedPost = await Post.findById(postId); // Refetch to get the updated likes
      return res.status(200).json(updatedPost.likes);
    } else {
      // Like the post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // Check if a similar notification already exists
      const existingNotification = await Notification.findOne({
        from: userId,
        to: post.user,
        type: "like",
        post: postId,
      });

      if (!existingNotification) {
        // Create a like notification
        const notification = new Notification({
          from: userId,
          to: post.user,
          type: "like",
          post: postId,
        });
        await notification.save();
      }

      return res.status(200).json(post.likes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log("error in getAllPost controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log("erro from getLikedPosts controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json(feedPosts);
  } catch (error) {
    console.log("error in the getFollowingPosts controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getUserPosts = async(req, res)=>{
  try {
    const {username} = req.params
    const user = await User.findOne({username})
    if(!user){
      return res.status(404).json({error: "user not found"})
    }
    const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({path: "comments.user", select: "-password"}).populate({path: "user", select: "-password"})
    return res.status(200).json(posts)

  } catch (error) {
    console.log('error in getUserPosts controller', error.message);
    return res.status(500).json({error: "internal server error"})
    
  }
}