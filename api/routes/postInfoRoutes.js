const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Post = require("../models/Post");

const salt = bcrypt.genSaltSync(10);
const secret = "awl57baw75i7awil57awaghhfd";

const uploadMiddleware = multer({ dest: "uploads/" });

const app = express();

app.post("/create", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (error, info) => {
      if (error) {
        res.status(401).json({ message: "Unauthorized - Invalid token" });
        return;
      }

      const { title, summary, content, category, tags } = req.body;

      const validTags = getTags(tags);

      let postDoc = await Post.create({
        title,
        summary,
        content,
        category,
        cover: newPath,
        author: info.id,
        tags: validTags,
      });

      res.json(postDoc);
    });
  } catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).json({ error: "Internal server error " });
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }
  try {
    let postDoc = await Post.findById(id).populate("author", ["fullname"]);

    if (postDoc) {
      res.json(postDoc);
    } else {
      res.json({ message: "Post not found" });
    }
  } catch (error) {
    console.error("Error fetching post: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/:id/updateViews", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).exec();

    if (!updatedPost) {
      return res.json({ message: "Post not found" });
    }

    res.json({ message: "Views updated successfully", updatedPost });
  } catch (error) {
    console.error("Error updating views: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/:postId/edit", uploadMiddleware.single("file"), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      newPath = path + "." + ext;
      fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (error, info) => {
      if (error) throw error;

      const { id, title, summary, content, category, tags } = req.body;
      const postDoc = await Post.findById(id);

      if (!postDoc) {
        res.status(400).json("Post not found");
        return;
      }

      const isAuthor =
        JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      const isAdmin = info.type === "admin";

      if (!isAuthor && !isAdmin) {
        res.status(400).json("You are not the author");
      }

      const updatedTags = tags.split(",").map((tag) => {
        const clearedTag = tag.replace(/[^a-zA-Z0-9\s]/g, "").trim();

        if (clearedTag.length > 2) {
          return clearedTag;
        } else {
          return null;
        }
      });

      const validTags = getTags(tags);

      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      postDoc.category = category;
      postDoc.tags = validTags;
      postDoc.cover = newPath ? newPath : postDoc.cover;

      const updatedPost = await postDoc.save();
      res.json(updatedPost);
    });
  } catch (error) {
    console.error("Error updating post: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/:id/comment", async (req, res) => {
  const postId = req.params.id;
  const { userId, desc } = req.body;

  try {
    if (!userId || !desc) {
      return res
        .status(400)
        .json({ message: "User ID and comment description are required" });
    }

    const user = await User.findById(userId).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId).populate("comments.user", "_id");
    if (!post) {
      return res.json({ message: "Post not found" });
    }

    const newComment = {
      user,
      desc,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/:id/:commentId", async (req, res) => {
  const { id, commentId } = req.params;
  const { token } = req.cookies;

  try {
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);
      const isAdmin = info.type === "admin";

      if (!isAuthor && !isAdmin) {
        res.status(400).json("You are not the author");
        return;
      }

      const commentIndex = post.comments.findIndex(
        (comment) => comment._id.toString() == commentId
      );

      if (commentIndex === -1) {
        return res.status(404).json({ message: "Comment not found" });
      }

      post.comments.splice(commentIndex, 1);
      await post.save();

      res.json({ message: "Comment deleted successfully", post });
    });
  } catch (error) {
    console.error("Error deleting comment:", error.message);

    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token has expired" });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  }
});

app.get("/:id/getcomments", async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId).populate("comments.user");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentsWithFullname = post.comments.map((comment) => ({
      user: {
        id: comment.user.id ? comment.user.id : null,
        fullname: comment.user.fullname ? comment.user.fullname : null,
      },
      desc: comment.desc,
      id: comment.id,
    }));

    res.status(200).json(commentsWithFullname);
  } catch (error) {
    console.error("Error fetching comments: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/:id/delete", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  try {
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);
      const isAdmin = info.type === "admin";

      if (!isAuthor && !isAdmin) {
        res.status(400).json("You are not the author");
      }

      await Post.deleteOne({ _id: id });

      res.json({ message: "Post deleted successfully", post });
    });
  } catch {
    console.error("Error deleting post: ", error.message);
    res.status(500).json({ message: "Internal server errror" });
  }
});

function getTags(tags) {
  const updatedTags = tags.split(",").map((tag) => {
    const clearedTag = tag.replace(/[^a-zA-Z0-9\s]/g, "").trim();

    if (clearedTag.length > 2) {
      return clearedTag;
    } else {
      return null;
    }
  });

  return updatedTags.filter((tag) => tag !== null && tag !== "");
}

module.exports = app;
