import styles from "../styles/Header.module.css";

import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";

const Header = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [showNav, setShowNav] = useState(false);

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowNav(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    try {
      fetch("http://localhost:3001/profile", {
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch user profile: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((userInfo) => {
          setUserInfo(userInfo);
        })
        .catch((error) => {
          console.error("Error fetching user profile: ", error.message);
        });
    } catch (error) {
      console.error("Error in useEffect:", error.message);
    }
  }, []);

  function onLogout() {
    fetch("http://localhost:3001/logout", {
      credentials: "include",
      method: "POST",
    });

    setUserInfo(null);
  }

  const LoggedIn = userInfo?.email;

  return (
    <header className={styles.fixedHeader}>
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.homeLink}>
            Home
          </Link>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.toggleButton} onClick={toggleNav}>
            ☰
          </div>
          {!showNav && (
            <div className={styles.navLinks}>
              <Link to="/posts" className={styles.navLink}>
                Posts
              </Link>
              {/* <Link to="/writers" className={styles.navLink}>
                Writers
              </Link> */}
              {LoggedIn ? (
                <>
                  <Link to="/create" className={styles.navLink}>
                    Create Post
                  </Link>
                  <a onClick={onLogout} className={styles.navLink}>
                    Logout
                  </a>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.navLink}>
                    Login
                  </Link>
                  <Link to="/register" className={styles.navLink}>
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
