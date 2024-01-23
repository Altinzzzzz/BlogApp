import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Post.module.css";
import { format } from "date-fns";

const truncateSummary = (text) => {
  let maxWords = 60;
  const words = text.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
};

const categoryStyleMap = {
  Sports: styles.categorySports,
  "Local News": styles.categoryLocalNews,
  Gaming: styles.categoryGaming,
  History: styles.categoryHistory,
  "International News": styles.categoryInternationalNews,
  Other: styles.categoryOther,
};

function Post(post) {
  const { _id, title, summary, cover, views, author, createdAt, category } =
    post;
  return (
    <div className={styles.post}>
      <div className={styles.imgContainer}>
        <Link to={`/post/${_id}`}>
          <img
            src={`http://localhost:3001/${cover}`}
            alt={title}
            className={styles.postImage}
          />
        </Link>
      </div>
      <div className={styles.postContent}>
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <h4 className={`${styles.category} ${categoryStyleMap[category]}`}>
          {category}
        </h4>
        <p className={styles.summary}>
          Summary: {truncateSummary(summary, 70)}
        </p>
        <p className={styles.info}>
          <a className={styles.author}>{author.fullname}</a> -
          <time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>
        </p>
        <div className={styles.moreInfo}>
          <p>
            <Link to={`/post/${_id}`} className={styles.readMoreLink}>
              Read More
            </Link>
          </p>
          <p>Views: {views}</p>
        </div>
      </div>
    </div>
  );
}

export default Post;
