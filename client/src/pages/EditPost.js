import styles from "../styles/CreatePost.module.css";
import { Navigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Editor from "../myEditors/Editor";
import { UserContext } from "../contexts/UserContext";

function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch(`http://localhost:3001/post/${id}`).then((response) => {
      response.json().then((postInfo) => {
        const isAuthor = userInfo.id === postInfo.author._id;
        const isAdmin = userInfo.type === "admin";

        setTitle(postInfo.title);
        setContent(postInfo.content);
        setSummary(postInfo.summary);
        setCategory(postInfo.category);
        setTags(postInfo.tags);

        if (!isAuthor && !isAdmin) {
          setIsAuthorized(false);
        }
      });
    }, []);
  }, [id, userInfo.id, userInfo.type]);

  async function updatePost(e) {
    e.preventDefault();

    if (!isAuthorized) {
      return;
    }

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("category", category);
    data.set("tags", tags);
    data.set("id", id);
    if (files?.[0]) {
      data.set("file", files?.[0]);
    }

    const response = await fetch(`http://localhost:3001/post/${id}/edit`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  return (
    <div className={styles.body}>
      <form className={styles.form} onSubmit={updatePost}>
        <input
          type="title"
          placeholder={"Title"}
          className={styles.inputField}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="summary"
          placeholder={"Summary"}
          className={styles.inputField}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <label className={category}>
          Category:
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.inputField}
          >
            <option value="Other">Other</option>
            <option value="Sports">Sports</option>
            <option value="Local News">Local News</option>
            <option value="Gaming">Gaming</option>
            <option value="History">History</option>
            <option value="International News">International News</option>
          </select>
        </label>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          className={styles.inputField}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          type="file"
          className={styles.fileInput}
          onChange={(e) => setFiles(e.target.files)}
        />
        <Editor value={content} onChange={setContent} />
        <button className={styles.button}>Edit Post</button>
      </form>
    </div>
  );
}

export default EditPost;
