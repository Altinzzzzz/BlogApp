import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../styles/PostPage.module.css";
import { format } from "date-fns";
import { UserContext } from "../contexts/UserContext";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const [commentAdded, setCommentAdded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://localhost:3001/postInfo/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const postInfo = await response.json();
        setPostInfo(postInfo);
        await getComments();
        setCommentAdded(false);
      } catch (error) {
        console.error("Error fetching post data:", error.message);
      }
    }

    fetchData();
  }, [commentAdded]);

  useEffect(() => {
    async function updateViews() {
      try {
        const response = await fetch(
          `http://localhost:3001/postInfo/${id}/updateViews`,
          {
            method: "PUT",
          }
        );
        if (response.ok) {
          console.log("Views updated successfully!");
        } else {
          console.error(
            "Failed to update views:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error updating views:", error);
      }
    }

    updateViews();
  }, []);

  async function getComments() {
    try {
      const response = await fetch(
        `http://localhost:3001/postInfo/${id}/getcomments`
      );

      if (response.ok) {
        const commentsWithFullname = await response.json();
        setComments(commentsWithFullname);
      } else {
        console.error(
          "Failed to fetch comments:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  async function addComment() {
    try {
      const response = await fetch(
        `http://localhost:3001/postInfo/${id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userInfo.id, desc: newComment }),
        }
      );

      if (response.ok) {
        setCommentAdded(true);
        setNewComment(""); // Clear the input field after adding a comment
      } else {
        console.error(
          "Failed to add comment:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  if (!postInfo) return null;

  async function deleteComment(commentId) {
    try {
      const response = await fetch(
        `http://localhost:3001/postInfo/${id}/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setCommentAdded(true);
    } catch (error) {
      console.error("Error deleting comment:", error.message);
    }
  }

  async function deletePost() {
    try {
      const response = await fetch(`http://localhost:3001/postInfo/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error deleting post:", error.message);
    }
  }

  const renderComments = () => (
    <ul>
      {comments.reverse().map((comment) => (
        <li key={comment.id} className={styles.commentContainer}>
          <strong>
            {comment.user?.fullname ? comment.user?.fullname : "Unknown"}:
          </strong>{" "}
          {comment.desc}
          {((comment.user && comment.user.id === userInfo.id) ||
            userInfo.id === postInfo?.author._id ||
            userInfo.type === "admin") && (
            <button
              className={styles.deleteCommentButton}
              onClick={() => deleteComment(comment.id)}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{postInfo?.title}</h1>
      <time className={styles.time}>
        {format(new Date(postInfo?.createdAt), "MMM d, yyyy HH:mm")}
      </time>
      <div className={styles.author}>by {postInfo?.author.fullname}</div>
      {(userInfo?.id === postInfo?.author._id ||
        userInfo?.type === "admin") && (
        <div className={styles.actionButtons}>
          <div className={styles.editContainer}>
            <Link to={`/edit/${id}`} className={styles.editBtn}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Edit this post
            </Link>
          </div>
          <div className={styles.editContainer}>
            <Link
              to={`/posts`}
              className={styles.removeBtn}
              onClick={() => deletePost()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Remove this post
            </Link>
          </div>
        </div>
      )}
      <p className={styles.views}>Views: {postInfo?.views / 2}</p>
      <div className={styles.imageContainer}>
        <img
          src={`http://localhost:3001/${postInfo?.cover}`}
          alt="Post Cover"
          className={styles.image}
        />
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
        className={styles.content}
      />
      <h2>Tags</h2>
      {(userInfo?.id === postInfo?.author._id ||
        userInfo?.type === "admin") && (
        <div className={styles.tagsContainer}>
          {postInfo.tags.map((tag) => (
            <div key={tag} className={styles.tag}>
              {tag}
            </div>
          ))}
        </div>
      )}
      <div className={styles.commentsContainer}>
        <h2 className={styles.commentHeading}>Comments</h2>
        {userInfo?.id && (
          <div className={styles.addCommentContainer}>
            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className={styles.commentTextArea}
            />
            <button onClick={addComment} className={styles.commentButton}>
              Add Comment
            </button>
          </div>
        )}
        {comments ? renderComments(postInfo.comments) : null}
      </div>
    </div>
  );
}
