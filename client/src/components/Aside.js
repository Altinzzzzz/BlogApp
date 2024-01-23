import styles from "../styles/Aside.module.css";

function Aside({
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  tagFilter,
  setTagFilter,
  onSearch,
}) {
  return (
    <aside className={styles.searchAside}>
      <h2>Search and Filter</h2>
      <label htmlFor="dateInput">Date Filter:</label>
      <div className={styles.radioContainer}>
        <label>
          <input
            type="radio"
            name="dateFilter"
            value="today"
            checked={dateFilter === "today"}
            onChange={() => setDateFilter("today")}
          />
          Today
        </label>
        <label>
          <input
            type="radio"
            name="dateFilter"
            value="lastMonth"
            checked={dateFilter === "lastMonth"}
            onChange={() => setDateFilter("lastMonth")}
          />
          Last Month
        </label>
        <label>
          <input
            type="radio"
            name="dateFilter"
            value="lastYear"
            checked={dateFilter === "lastYear"}
            onChange={() => setDateFilter("lastYear")}
          />
          Last Year
        </label>
        <label>
          <input
            type="radio"
            name="dateFilter"
            value="all"
            checked={dateFilter === "all"}
            onChange={() => setDateFilter("all")}
          />
          All
        </label>
      </div>
      <label htmlFor="dateInput">Type Filter:</label>
      <div className={styles.radioContainer}>
        <label>
          <input
            type="radio"
            name="latest"
            value="latest"
            checked={typeFilter === "latest"}
            onChange={() => setTypeFilter("latest")}
          />
          Latest
        </label>
        <label>
          <input
            type="radio"
            name="popular"
            value="popular"
            checked={typeFilter === "popular"}
            onChange={() => setTypeFilter("popular")}
          />
          Popular
        </label>
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="tagInput">Tag Name:</label>
        <input
          type="text"
          id="tagInput"
          className={styles.tagInput}
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
      </div>
      <button className={styles.searchButton} onClick={onSearch}>
        Search
      </button>
    </aside>
  );
}

export default Aside;
