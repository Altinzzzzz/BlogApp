import React, { useEffect, useState } from "react";
import styles from "../styles/Article.module.css";
import { format } from "date-fns";
import { Post } from "../pages/index";

function Article({ selectedCategory, articleFilter }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (articleFilter) {
      fetchFilteredPosts();
    } else if (selectedCategory) {
      fetchCategoryPosts();
    } else {
      fetchPopularPosts();
    }
  }, [selectedCategory, articleFilter]);

  async function fetchPopularPosts() {
    try {
      const response = await fetch("http://localhost:3001/popularposts");
      if (!response.ok) {
        throw new Error("Failed to fetch popular posts");
      }
      const popularPosts = await response.json();
      if (popularPosts.length === 0) {
        alert("No popular posts found.");
      } else {
        setPosts(popularPosts);
      }
    } catch (error) {
      console.error("Error fetching popular posts: ", error);
    }
  }

  async function fetchCategoryPosts() {
    try {
      const response = await fetch(
        `http://localhost:3001/posts/category?category=${selectedCategory}`
      );
      if (!response.ok) {
        throw new Error("Error fetching posts based on category");
      }
      const categoryPosts = await response.json();
      setPosts(categoryPosts);
    } catch (error) {
      console.error("Error fetching category posts:", error);
    }
  }

  async function fetchFilteredPosts() {
    try {
      const url = new URL("http://localhost:3001/filteredPosts");
      const params = new URLSearchParams();

      if (articleFilter.dateFilter) {
        params.set("dateFilter", articleFilter.dateFilter);
      }

      if (articleFilter.typeFilter) {
        params.set("typeFilter", articleFilter.typeFilter);
      }

      if (articleFilter.tagFilter) {
        params.set("tagFilter", articleFilter.tagFilter);
      }

      url.search = params.toString();
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch filtered posts");
      }
      const fetchedPosts = await response.json();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  }

  return (
    <div className={styles.container}>
      {Array.isArray(posts) && posts.length === 0 ? (
        <h1 style={{ textAlign: "center" }}>No posts available</h1>
      ) : (
        <div className={styles.postsContainer}>
          {Array.isArray(posts) &&
            posts.map((post) => <Post key={post._id} {...post} />)}
        </div>
      )}
      {!Array.isArray(posts) &&
        console.error("Invalid 'posts' data type:", typeof posts)}
    </div>
  );
}

export default Article;
