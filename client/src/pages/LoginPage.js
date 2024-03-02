import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Inputbox } from "../components";
import styles from "./Authentication.module.css";
import { UserContext } from "../contexts/UserContext";

const LoginPage = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  async function login(e) {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.status === 200) {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      alert("Invalid email or password");
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className={styles.body}>
      <form className={styles.form} onSubmit={login}>
        <h2>Login</h2>
        <div className={styles.input}>
          <div className={styles.inputBox}>
            <Inputbox
              label="Email Address"
              name="email"
              type="email"
              isRequired={true}
              placeholder="Email address..."
              value={data?.email}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputBox}>
            <Inputbox
              label="Password"
              name="password"
              type="password"
              isRequired={true}
              placeholder="Password..."
              value={data?.password}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputBox}>
            <input type="submit" name="" value="Sign In" />
          </div>
        </div>
        <p className={styles.forget}>
          Don't have an account <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
