import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Inputbox } from "../components";
import styles from "./Authentication.module.css";

export default function RegisterPage() {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    type: "user",
  });
  const [redirect, setRedirect] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  async function register(e) {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        type: data.type,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      alert("Registration successful.");
      setRedirect(true);
    } else {
      alert("Registration failed");
    }
  }

  if (redirect) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className={styles.body}>
      <form className={styles.form} onSubmit={register}>
        <h2>Register</h2>
        <div className={styles.input}>
          <div className={styles.inputBox}>
            <label htmlFor="type">User Type:</label>
            <select
              id="type"
              name="type"
              value={data.type}
              onChange={handleChange}
            >
              <option value="user" selected>
                User
              </option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className={styles.inputBox}>
            <Inputbox
              label="First Name"
              name="firstName"
              type="text"
              isRequired={true}
              placeholder="First Name..."
              value={data?.firstName}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputBox}>
            <Inputbox
              label="Last Name"
              name="lastName"
              type="text"
              isRequired={true}
              placeholder="Last Name..."
              value={data?.lastName}
              onChange={handleChange}
            />
          </div>
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
            <input type="submit" name="" value="Register" />
          </div>
        </div>
        <p className={styles.forget}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
