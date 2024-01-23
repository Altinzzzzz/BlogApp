import { useEffect, useState } from "react";
import { Article, Aside, Navbar } from "../components/index";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState("");
  const [articleFilter, setArticleFilter] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  useEffect(() => {
    fetch("http://localhost:3001/popularposts").then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      response
        .json()
        .then((posts) => {
          setPosts(posts);
        })
        .catch((error) => {
          console.error("Error during fetch: ", error.message);
        });
    });
  }, []);

  function handleSearch() {
    const filters = {};

    if (dateFilter) {
      filters.dateFilter = dateFilter;
    }

    if (typeFilter) {
      filters.typeFilter = typeFilter;
    }

    if (tagFilter) {
      filters.tagFilter = tagFilter;
    }

    setArticleFilter(filters);
  }

  return (
    <>
      <Navbar onCategoryClick={setSelectedCategory} />
      <main style={{ display: "grid", gridTemplateColumns: "1fr 4fr" }}>
        <Aside
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          onSearch={handleSearch}
        />
        <Article
          selectedCategory={selectedCategory}
          articleFilter={articleFilter}
        />
      </main>
    </>
  );
}

export default Posts;
