import bcrypt from "bcryptjs";
import { pool } from "../lib/db.js";

const toUser = (row) =>
  row
    ? {
        _id: String(row.id),
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        password: row.password,
        profilePic: row.profile_pic || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

export const findOne = async (where) => {
  const keys = Object.keys(where);
  if (keys.length === 0) return null;
  const key = keys[0];
  const val = where[key];
  const col = key === "email" ? "email" : key === "_id" || key === "id" ? "id" : key;
  const res = await pool.query(`SELECT * FROM users WHERE ${col} = $1`, [val]);
  return toUser(res.rows[0]);
};

export const findById = async (id) => {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return toUser(res.rows[0]);
};

export const findByIdAndUpdate = async (id, updates, opts = {}) => {
  const { profilePic } = updates;
  const res = await pool.query(
    "UPDATE users SET profile_pic = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [profilePic, id]
  );
  return toUser(res.rows[0]);
};

export const find = async (where = {}) => {
  if (Object.keys(where).length === 0) {
    const res = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return res.rows.map(toUser);
  }
  const keys = Object.keys(where);
  if (keys.length === 1 && keys[0] === "_id") {
    const cond = where._id;
    if (cond && typeof cond === "object" && cond.$ne) {
      const res = await pool.query("SELECT * FROM users WHERE id != $1 ORDER BY created_at DESC", [
        cond.$ne,
      ]);
      return res.rows.map(toUser);
    }
  }
  const res = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  return res.rows.map(toUser);
};

export const create = async (data) => {
  const res = await pool.query(
    "INSERT INTO users (email, full_name, password, profile_pic) VALUES ($1, $2, $3, $4) RETURNING *",
    [data.email, data.fullName, data.password, data.profilePic || ""]
  );
  return toUser(res.rows[0]);
};

export const insertMany = async (docs) => {
  const results = [];
  for (const doc of docs) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(doc.password, salt);
    const user = await create({
      email: doc.email,
      fullName: doc.fullName,
      password: hashedPassword,
      profilePic: doc.profilePic || "",
    });
    results.push(user);
  }
  return results;
};

export default {
  findOne,
  findById,
  findByIdAndUpdate,
  find,
  create,
  insertMany,
};
