import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  const { username, fullName, password, email } = req.body;

  try {
    // Validating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be 6 characters or more" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the new user before generating the token
    await newUser.save();

    // Generate token and set cookie
    generateTokenAndSetCookie(newUser._id, res);

    // Return success response (omit sensitive data)
    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      followers: newUser.followers || [],
      following: newUser.following || [],
      profileImg: newUser.profileImg || null,
      coverImg: newUser.coverImg || null,
    });
  } catch (error) {
    console.error("Error in signup controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isValidPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isValidPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers || [],
      following: user.following || [],
      profileImg: user.profileImg || null,
      coverImg: user.coverImg || null,
    });
  } catch (error) {
    console.log("error in login page", error.message);
    return res.status(400).json({ error: "internal server error" });
  }
};

export const logout = async(req, res)=>{
    try {
        res.cookie("jwt", "", {maxAge: 0})
        return res.status(200).json({message: 'logged out successfuly!'})
    } catch (error) {
        console.log('error in logout controller', error.message);
        return res.status(500).json({error: "Internal server error"})
        
    }
}

export const getMe = async (req, res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        console.log("Erro from getMe controller", error.message);
        return res.status(500).json({error:"internal server error"})        
    }
}