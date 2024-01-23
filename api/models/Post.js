const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    desc: { type: String, required: true },
  },
  { timestamps: true }
);

const PostSchema = new Schema(
  {
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    comments: [CommentSchema],
    tags: [{ type: String }],
    category: {
      type: String,
      enum: [
        "Sports",
        "Local News",
        "Gaming",
        "History",
        "International News",
        "Other",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const PostModel = model("Post", PostSchema);

module.exports = PostModel;
