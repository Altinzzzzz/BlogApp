const express = require("express");
const Post = require("../models/Post");

const app = express();

app.get("/getCategories", async (req, res) => {
  const categories = Post.schema.path("category").enumValues;
  res.json(categories);
});

module.exports = app;
