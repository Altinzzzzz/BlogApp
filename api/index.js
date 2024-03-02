const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

connectDB();

const authRoutes = require("./routes/authRoutes");
const postsRoutes = require("./routes/postsRoutes");
const postInfoRoutes = require("./routes/postInfoRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/postInfo", postInfoRoutes);
app.use("/category", categoryRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
