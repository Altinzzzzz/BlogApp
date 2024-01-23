const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    fullname: { type: String, required: true, min: 4 },
    email: { type: String, required: true, min: 2, unique: true },
    password: { type: String, required: true, min: 7 },
    type: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const UserModel = model("User", UserSchema);

module.exports = UserModel;
