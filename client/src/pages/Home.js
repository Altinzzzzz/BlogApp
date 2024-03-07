import { useEffect, useState } from "react";
import { Navbar } from "../components/index";
import { Post } from "./index";
import styles from "../styles/Posts.module.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/posts/popularposts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        response.json().then((posts) => {
          setPosts(posts);
        });
      })
      .catch((error) => {
        console.error("Error during fetch: ", error);
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`http://localhost:3001/posts/category?category=${selectedCategory}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error fetching posts based on category");
          }
          response.json().then((categoryPosts) => {
            setPosts(categoryPosts);
          });
        })
        .catch((error) => {
          console.error("Error during fetch: ", error);
        });
    }
  }, [selectedCategory, page]);

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Navbar onCategoryClick={setSelectedCategory} />
      <main className={styles.mainPage}>
        {posts && Array.isArray(posts) && posts.length > 0 && (
          <h1
            style={{
              textAlign: "center",
              borderBottom: "1px solid white",
              paddingTop: "0",
              marginTop: "0",
            }}
          >
            {selectedCategory === null
              ? "Popular Posts"
              : `Posts in ${selectedCategory}`}
          </h1>
        )}
        <div className={styles.postsContainer}>
          {posts && Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post) => <Post key={post._id} {...post} />)
          ) : (
            <h1 style={{ textAlign: "center" }}>
              {posts && posts.length === 0
                ? "No posts available"
                : "Error loading posts"}
            </h1>
          )}
        </div>
        <div className={styles.pagination}>
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
      </main>
    </div>
  );
}

export default Home;
