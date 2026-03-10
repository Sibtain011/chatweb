import { getReceiverSocketId } from "../lib/socket.js";
import { pool } from "../lib/db.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const result = await pool.query(
      "SELECT id, fullname, email FROM users WHERE id != $1",
      [loggedInUserId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user?.id;

    // 🔹 Check if user is authenticated
    if (!myId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔹 Validate chat user id
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const userToChatId = parseInt(id);

    const result = await pool.query(
      `SELECT *
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [myId, userToChatId]
    );

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error in getMessages controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl = null;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, text, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [senderId, receiverId, text, imageUrl]
    );

    const newMessage = result.rows[0];

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};