const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../models/User");

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = "awl57baw75i7awil57awaghhfd";

app.use(express.json());
app.use(cookieParser());

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

module.exports = app;
