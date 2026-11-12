import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Form states
  const [identifier, setIdentifier] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!identifier.trim() || !password) {
          throw new Error("Please provide username/email and password");
        }
        await login(identifier.trim(), password);
      } else {
        if (!username.trim() || !email.trim() || !password) {
          throw new Error("All fields are required for signup");
        }
        await register(username.trim(), email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Project & Task Hub</h1>
          <p style={styles.subtitle}>Clean Architecture Management Tool</p>
        </div>

        {/* Tab Switcher */}
        <div style={styles.tabs}>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(isLogin ? styles.activeTab : {})
            }}
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            <LogIn size={18} style={{ marginRight: 6 }} /> Sign In
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(!isLogin ? styles.activeTab : {})
            }}
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            <UserPlus size={18} style={{ marginRight: 6 }} /> Create Account
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isLogin ? (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                placeholder="Enter username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Unique Username</label>
                <input
                  type="text"
                  placeholder="e.g. alex99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "36px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
    border: "1px solid #334155"
  },
  header: {
    textAlign: "center",
    marginBottom: "24px"
  },
  title: {
    color: "#f8fafc",
    fontSize: "26px",
    fontWeight: "700",
    margin: "0 0 6px 0"
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0
  },
  tabs: {
    display: "flex",
    backgroundColor: "#0f172a",
    borderRadius: "10px",
    padding: "4px",
    marginBottom: "24px"
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  activeTab: {
    backgroundColor: "#3b82f6",
    color: "#ffffff"
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    marginBottom: "20px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "500"
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontSize: "15px",
    outline: "none"
  },
  submitBtn: {
    marginTop: "8px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s"
  }
};
