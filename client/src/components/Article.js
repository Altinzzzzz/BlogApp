import React, { useEffect, useState } from "react";
import styles from "../styles/Article.module.css";
import { format } from "date-fns";
import { Post } from "../pages/index";

function Article({ selectedCategory, articleFilter }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    if (articleFilter) {
      fetchFilteredPosts();
    } else if (selectedCategory) {
      fetchCategoryPosts();
    } else {
      fetchPopularPosts();
    }
  }, [selectedCategory, articleFilter, page]);

  async function fetchPopularPosts() {
    try {
      const response = await fetch(
        `http://localhost:3001/posts/popularposts?page=${page}&limit=${limit}`
      );
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
        `http://localhost:3001/posts/category?category=${selectedCategory}?page=${page}&limit=${limit}`
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
      const url = new URL(
        `http://localhost:3001/posts/filteredPosts?page=${page}&limit=${limit}`
      );
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

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  return (
    <>
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
        <div className={styles.pagination} style={{ marginRight: "50px" }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span style={{ color: "white", padding: "20px" }}>Page {page}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={posts.length < limit}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default Article;
