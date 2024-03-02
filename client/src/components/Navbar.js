import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.css";

const categoryStyleMap = {
  Sports: styles.categorySports,
  "Local News": styles.categoryLocalNews,
  Gaming: styles.categoryGaming,
  History: styles.categoryHistory,
  "International News": styles.categoryInternationalNews,
  Other: styles.categoryOther,
};

function Navbar({ onCategoryClick }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/category/getCategories")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch categories: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((cat) => {
        setCategories(cat);
      })
      .catch((error) => {
        console.error("Error fetching categories: ", error.message);
      });
  }, []);

  function handleCategoryClick(category) {
    onCategoryClick(category);
  }

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {categories &&
          categories?.map((category) => (
            <li
              key={category}
              className={`${styles.category} ${categoryStyleMap[category]}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
      </ul>
    </nav>
  );
}

export default Navbar;
