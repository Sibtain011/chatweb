  import { pool } from "../lib/db.js";

  const toMessage = (row) =>
    row
      ? {
          _id: String(row.id),
          id: row.id,
          senderId: String(row.sender_id),
          receiverId: String(row.receiver_id),
          text: row.text,
          image: row.image,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      : null;

  export const find = async (filter) => {
    if (filter.$or) {
      const [a, b] = filter.$or;

      const res = await pool.query(
        `SELECT * FROM messages 
        WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $3 AND receiver_id = $4)
        ORDER BY created_at ASC`,
        [a.senderId, a.receiverId, b.senderId, b.receiverId]
      );

      return res.rows.map(toMessage);
    }

    const res = await pool.query(
      "SELECT * FROM messages ORDER BY created_at ASC"
    );

    return res.rows.map(toMessage);
  };

  export const create = async (data) => {
    const res = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, text, image)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [data.senderId, data.receiverId, data.text || null, data.image || null]
    );

    return toMessage(res.rows[0]);
  };

  export default {
    find,
    create,
  };