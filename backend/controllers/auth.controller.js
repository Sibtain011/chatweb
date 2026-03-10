import  {pool}  from "../lib/db.js";
import jwt from "jsonwebtoken";

/* =========================
   SIGNUP
========================= */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (fullname,email,password) VALUES ($1,$2,$3) RETURNING *",
      [fullName, email, hashedPassword]
    );

    const user = newUser.rows[0];

    generateToken(user.id, res);

    res.status(201).json({
      id: user.id,
      fullName: user.fullname,
      email: user.email,
      profilePic: user.profile_pic,
    });

  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      fullName: user.fullname,
      email: user.email,
      profilePic: user.profile_pic,
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (req, res) => {
  try {

    const { profilePic } = req.body;
    const userId = req.user.id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    await pool.query(
      "UPDATE users SET profile_pic=$1 WHERE id=$2",
      [uploadResponse.secure_url, userId]
    );

    const updatedUser = await pool.query(
      "SELECT id,fullname,email,profile_pic FROM users WHERE id=$1",
      [userId]
    );

    res.status(200).json(updatedUser.rows[0]);

  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   CHECK AUTH
========================= */
export const checkAuth = async (req, res) => {
  try {

    const token = req.cookies?.jwt;

    if (!token) return res.status(200).json(null);

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(200).json(null);
    }

    const result = await pool.query(
      "SELECT id,fullname,email,profile_pic FROM users WHERE id=$1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json(null);
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
};