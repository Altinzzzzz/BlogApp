import styles from "../styles/CreatePost.module.css";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import Editor from "../myEditors/Editor";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(e) {
    e.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("category", category);
    data.set("tags", tags);
    data.set("file", files[0]);
    const response = await fetch("http://localhost:3001/postInfo/create", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className={styles.body}>
      <form className={styles.form} onSubmit={createNewPost}>
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
        <button className={styles.button}>Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;
