import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("error in getUser Profile controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id == req.user._id) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourdelf" });
    }
    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // send notification to the user
      const newNotification = await Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      // TODO return the id of the user as the response
      return res.status(200).json({ message: "User followed successfully!" });
    }
  } catch (error) {
    console.log("error in followUnfollowUser controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    return res.status(200).json( suggestedUsers );
  } catch (error) {
    console.log("error in getSuggested users controller", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
    const { username, fullName, link, bio, email, currentPassword, newPassword } =
      req.body;
    let { profileImg, coverImg } = req.body;
  
    const userId = req.user._id;
    try {
      let user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Handle password update logic
      if (
        (!newPassword && currentPassword) ||
        (!currentPassword && newPassword)
      ) {
        return res
          .status(400)
          .json({ error: "Please provide both current and new password" });
      }
  
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password); // Added await here
        if (!isMatch)
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        if (newPassword.length < 6)
          return res
            .status(400)
            .json({ error: "Password should be at least 6 characters long" });
  
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt); // Only hash if new password is provided
      }
  
      // Handle profile image update
      if (profileImg) {
        if (user.profileImg) {
          await cloudinary.uploader.destroy(
            user.profileImg.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
      }
  
      // Handle cover image update
      if (coverImg) {
        if (user.coverImg) {
          await cloudinary.uploader.destroy(
            user.coverImg.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
      }
  
      // Update user fields
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.link = link || user.link;
      user.profileImg = profileImg || user.profileImg;
      user.coverImg = coverImg || user.coverImg;
  
      // Save the updated user details
      user = await user.save();
  
      // Exclude password from response
      user.password = undefined;
  
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error from update user controller", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
