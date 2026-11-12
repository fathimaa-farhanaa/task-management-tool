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
        <div style={styles.userBadge}>
          <div style={styles.avatar}>
            <User size={15} color="#2563eb" />
          </div>
          <span style={styles.username}>@{user?.username}</span>
        </div>

        <button onClick={logout} style={styles.logoutBtn} title="Sign Out">
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    height: "68px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 36px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    padding: "5px 10px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
  },
  brandName: {
    color: "#0f172a",
    fontSize: "19px",
    fontWeight: "700",
    letterSpacing: "-0.3px"
  },
  navLinks: {
    display: "flex",
    gap: "6px",
    backgroundColor: "#f1f5f9",
    padding: "4px",
    borderRadius: "10px"
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease"
  },
  activeNavBtn: {
    backgroundColor: "#ffffff",
    color: "#2563eb",
    fontWeight: "600",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)"
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: "20px"
  },
  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  username: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600"
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    borderRadius: "8px",
    border: "1px solid #fee2e2",
    backgroundColor: "#fff5f5",
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease"
  }
};
