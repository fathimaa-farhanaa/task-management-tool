import React from "react";
import { useAuth } from "../features/auth/AuthContext";
import { LayoutDashboard, CheckSquare, FolderKanban, LogOut, User } from "lucide-react";

export type NavTab = "dashboard" | "personal" | "projects";

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  return (
    <header style={styles.navbar}>
      <div style={styles.brand}>
        <div style={styles.logoBadge}>TM</div>
        <span style={styles.brandName}>TaskFlow</span>
      </div>

      <nav style={styles.navLinks}>
        <button
          onClick={() => onSelectTab("dashboard")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "dashboard" ? styles.activeNavBtn : {})
          }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab("personal")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "personal" ? styles.activeNavBtn : {})
          }}
        >
          <CheckSquare size={18} />
          <span>Personal Tasks</span>
        </button>

        <button
          onClick={() => onSelectTab("projects")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "projects" ? styles.activeNavBtn : {})
          }}
        >
          <FolderKanban size={18} />
          <span>Projects</span>
        </button>
      </nav>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <User size={16} color="#94a3b8" />
          <span style={styles.username}>@{user?.username}</span>
        </div>
        <button onClick={logout} style={styles.logoutBtn} title="Sign Out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    height: "64px",
    backgroundColor: "#1e293b",
    borderBottom: "1px solid #334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  logoBadge: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    padding: "4px 8px",
    borderRadius: "6px"
  },
  brandName: {
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: "700"
  },
  navLinks: {
    display: "flex",
    gap: "8px"
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s"
  },
  activeNavBtn: {
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    fontWeight: "600"
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  username: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "500"
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #475569",
    backgroundColor: "transparent",
    color: "#f87171",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer"
  }
};
