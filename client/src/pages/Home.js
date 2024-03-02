import { useEffect, useState } from "react";
import { Navbar } from "../components/index";
import { Post } from "./index";
import styles from "../styles/Posts.module.css";

function Home() {
  const [posts, setPosts] = useState([]);
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
  }, [selectedCategory]);

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
        {posts && Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => <Post key={post._id} {...post} />)
        ) : (
          <h1 style={{ textAlign: "center" }}>
            {posts && posts.length === 0
              ? "No posts available"
              : "Error loading posts"}
          </h1>
        )}
      </main>
    </div>
  );
}

export default Home;
