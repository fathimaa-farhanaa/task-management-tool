import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { DashboardOverviewDTO, TaskStatus } from "../../types/api.types";
import { FolderGit2, Users, CheckCircle2, Clock, ListTodo } from "lucide-react";

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<DashboardOverviewDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardOverviewDTO>("/tasks/dashboard/overview");
      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard overview");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return { backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" };
      case "IN_PROGRESS":
        return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" };
      case "TODO":
      default:
        return { backgroundColor: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" };
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard overview...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Dashboard Overview</h1>
        <p style={styles.pageSubtitle}>Summary of your projects and task assignments</p>
      </div>

      {/* Metric Cards */}
      <div style={styles.grid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#2563eb")}>
            <FolderGit2 size={24} color="#2563eb" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.hostedProjectsCount ?? 0}</div>
            <div style={styles.metricLabel}>Hosted Projects</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#7c3aed")}>
            <Users size={24} color="#7c3aed" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.memberProjectsCount ?? 0}</div>
            <div style={styles.metricLabel}>Member Projects</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#0891b2")}>
            <ListTodo size={24} color="#0891b2" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.personalTasks.length ?? 0}</div>
            <div style={styles.metricLabel}>Personal Tasks</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#059669")}>
            <CheckCircle2 size={24} color="#059669" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.assignedProjectTasks.length ?? 0}</div>
            <div style={styles.metricLabel}>Assigned Project Tasks</div>
          </div>
        </div>
      </div>

      {/* Sections Split */}
      <div style={styles.columns}>
        {/* Assigned Project Tasks */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <Clock size={20} color="#2563eb" />
            <h2 style={styles.sectionTitle}>Project Tasks Assigned to You</h2>
          </div>
          {data?.assignedProjectTasks.length === 0 ? (
            <p style={styles.emptyText}>No project tasks currently assigned to you.</p>
          ) : (
            <div style={styles.taskList}>
              {data?.assignedProjectTasks.map((task) => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={styles.taskTitleRow}>
                    <span style={styles.taskTitle}>{task.title}</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(task.status)
                      }}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Personal Tasks */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <ListTodo size={20} color="#0891b2" />
            <h2 style={styles.sectionTitle}>Recent Personal Tasks</h2>
          </div>
          {data?.personalTasks.length === 0 ? (
            <p style={styles.emptyText}>No personal tasks created yet.</p>
          ) : (
            <div style={styles.taskList}>
              {data?.personalTasks.slice(0, 5).map((task) => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={styles.taskTitleRow}>
                    <span style={styles.taskTitle}>{task.title}</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(task.status)
                      }}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, any> = {
  container: {
    padding: "36px 40px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  loading: {
    color: "#64748b",
    textAlign: "center",
    padding: "60px",
    fontSize: "16px"
  },
  error: {
    color: "#b91c1c",
    padding: "16px 20px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    margin: "32px auto",
    maxWidth: "800px"
  },
  header: {
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.5px",
    margin: "0 0 6px 0"
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
    marginBottom: "36px"
  },
  metricCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease"
  },
  metricIconBox: (color: string) => ({
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: `${color}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  }),
  metricValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: "1.2"
  },
  metricLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#64748b",
    marginTop: "2px"
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "28px"
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "26px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "14px"
  },
  sectionTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    fontStyle: "italic",
    padding: "24px 0"
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  taskItem: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    transition: "background-color 0.15s ease, border-color 0.15s ease"
  },
  taskTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px"
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b"
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 9px",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px"
  },
  taskDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: "8px 0 0 0",
    lineHeight: "1.4"
  }
};
