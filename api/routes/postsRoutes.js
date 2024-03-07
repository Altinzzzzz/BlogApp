const express = require("express");
const Post = require("../models/Post");

const app = express();

app.get("/category", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;

  const startIndex = (page - 1) * limit;

  const category = req.query.category;

  if (!category) {
    return res.status(400).json({ error: "Category is missing." });
  }

  try {
    const posts = await Post.find({ category: category })
      .populate("author", ["fullname"])
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by category: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/popularposts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;

    const startIndex = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", ["fullname"])
      .sort({ views: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/latestposts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;

    const startIndex = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", ["fullname"])
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts: ", error);
    res.json([{ error: "Internal server error" }]);
  }
});

app.get("/filteredPosts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;

    const startIndex = (page - 1) * limit;

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
        .skip(startIndex)
        .limit(limit);
    } else {
      posts = await Post.find(query)
        .populate("author", ["fullname"])
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);
    }

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by category: ", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

module.exports = app;
