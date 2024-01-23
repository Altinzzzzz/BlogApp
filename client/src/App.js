import "./App.css";
import { Link, Route, Router, Routes } from "react-router-dom";
import { UserContextProvider } from "./contexts/UserContext";

import {
  CreatePost,
  CategoriesPage,
  Home,
  LoginPage,
  Posts,
  RegisterPage,
  PostPage,
  EditPost,
} from "./pages/index";
import { Layout } from "./components/index";
import { useState } from "react";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="posts" element={<Posts />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="post/:id" element={<PostPage />} />
          <Route path="edit/:id" element={<EditPost />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
