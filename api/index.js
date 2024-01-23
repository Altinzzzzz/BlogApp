const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer"); // to deal with files
const fs = require("fs"); // to rename files

const salt = bcrypt.genSaltSync(10);
const secret = "awl57baw75i7awil57awaghhfd";

const app = express();
const User = require("./models/User");
const Post = require("./models/Post");

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

const uploadMiddleware = multer({ dest: "uploads/" });

mongoose.connect(
  "mongodb+srv://username:password@cluster0.q9rieey.mongodb.net/Test"
);

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, type } = req.body;
    if (!firstName || !lastName || !email || !password || !type) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists. Please use a different email address.",
      });
    }

    const userDoc = await User.create({
      fullname: firstName + " " + lastName,
      email,
      password: bcrypt.hashSync(password, salt),
      type,
    });

    const token = jwt.sign(
      { email, id: userDoc._id, type: userDoc.type },
      secret,
      { expiresIn: "1h" },
      (error, token) => {
        if (error) throw error;
        res.cookie("token", token).json({
          id: userDoc._id,
          email,
          type: userDoc.type,
        });
      }
    );
  } catch (error) {
    console.error("Error during registration: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });

    if (!userDoc) res.status(400).json("User not found");

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign(
        { email, id: userDoc._id, type: userDoc.type },
        secret,
        { expiresIn: "1h" },
        (error, token) => {
          if (error) throw error;
          res.cookie("token", token).json({
            id: userDoc._id,
            email,
            type: userDoc.type,
          });
        }
      );
    } else {
      res.status(400).json("Wrong credentials");
    }
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

  jwt.verify(token, secret, {}, (error, info) => {
    if (error) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.json(info);
  });
});

app.post("/logout", async (req, res) => {
  res.cookie("token", "").json("Logged out");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
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

app.get("/post/:id", async (req, res) => {
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

app.put("/post/updateViews/:id", async (req, res) => {
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

app.put(
  "/post/:postId/edit",
  uploadMiddleware.single("file"),
  async (req, res) => {
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
  }
);

app.get("/popularposts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["fullname"])
      .sort({ views: -1, createdAt: -1 })
      .limit(10);
    console.log(posts);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts: ", error);
    res.json({ error: "Internal server error" });
  }
});

app.get("/latestposts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["fullname"])
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts: ", error);
    res.json({ error: "Internal server error" });
  }
});

app.post("/post/:id/comment", async (req, res) => {
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

app.get("/post/:id/getcomments", async (req, res) => {
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

app.get("/getCategories", async (req, res) => {
  const categories = Post.schema.path("category").enumValues;
  res.json(categories);
});

app.get("/posts/category", async (req, res) => {
  const category = req.query.category;

  if (!category) {
    return res.status(400).json({ error: "Category is missing." });
  }

  try {
    const posts = await Post.find({ category: category })
      .populate("author", ["fullname"])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by category: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/filteredPosts", async (req, res) => {
  try {
    const dateFilter = req.query.dateFilter;
    const typeFilter = req.query.typeFilter;
    const tagFilter = req.query.tagFilter;
    let query = {};

    if (dateFilter === "today") {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setUTCHours(23, 59, 59, 999);
      query.createdAt = { $gte: todayStart, $lte: todayEnd };
    } else if (dateFilter === "lastMonth") {
      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setUTCHours(0, 0, 0, 0);
      query.createdAt = { $gte: lastMonthStart };
    } else if (dateFilter === "lastYear") {
      const lastYearStart = new Date();
      lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
      lastYearStart.setUTCHours(0, 0, 0, 0);
      query.createdAt = { $gte: lastYearStart };
    }

    if (tagFilter) {
      query.tags = { $in: [tagsArray] };
    }

    let posts;

    if (typeFilter === "popular") {
      posts = await Post.find(query)
        .populate("author", ["fullname"])
        .sort({ views: -1 })
        .limit(10);
    } else {
      posts = await Post.find(query)
        .populate("author", ["fullname"])
        .sort({ createdAt: -1 })
        .limit(10);
    }

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by category: ", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

app.delete("/post/:id/:commentId", async (req, res) => {
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

app.delete("/delete/post/:id/", async (req, res) => {
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

app.listen(3001);

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
