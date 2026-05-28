import { useState } from "react";
import styles from "./Authentication.module.css";
import SmallLogo from "./assets/small-logo.png";
import { EyeClosed, LucideEye } from "lucide-react";
import { runtime } from "../../runtimeConfig";

interface AuthenticationProps {
  mobileMode: boolean;
}

function Authentication({ mobileMode }: AuthenticationProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        runtime.VITE_BACKEND_ADDRESS + "/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        },
      );
      console.log("Login response:", response);
      if (!response.ok) {
        throw new Error("Login failed");
      }
      window.location.reload();
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <img
        src={SmallLogo}
        alt="htmlOS NEXT logo"
        className={`${styles.logo} ${mobileMode ? styles.mobile : ""}`}
      />
      <div
        className={`${styles.auth} ${error ? styles.shake : ""} ${mobileMode ? styles.mobile : ""}`}
      >
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeClosed /> : <LucideEye />}
            </button>
          </div>
          <button type="submit" className={styles.authButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authentication;
