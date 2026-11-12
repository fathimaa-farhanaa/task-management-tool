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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return "#22c55e";
      case "IN_PROGRESS":
        return "#38bdf8";
      case "TODO":
      default:
        return "#f59e0b";
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
          <div style={styles.metricIconBox("#3b82f6")}>
            <FolderGit2 size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.hostedProjectsCount ?? 0}</div>
            <div style={styles.metricLabel}>Hosted Projects</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#8b5cf6")}>
            <Users size={24} color="#8b5cf6" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.memberProjectsCount ?? 0}</div>
            <div style={styles.metricLabel}>Member Projects</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#06b6d4")}>
            <ListTodo size={24} color="#06b6d4" />
          </div>
          <div>
            <div style={styles.metricValue}>{data?.personalTasks.length ?? 0}</div>
            <div style={styles.metricLabel}>Personal Tasks</div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconBox("#10b981")}>
            <CheckCircle2 size={24} color="#10b981" />
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
            <Clock size={18} color="#38bdf8" />
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
                        backgroundColor: `${getStatusColor(task.status)}20`,
                        color: getStatusColor(task.status)
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
            <ListTodo size={18} color="#06b6d4" />
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
                        backgroundColor: `${getStatusColor(task.status)}20`,
                        color: getStatusColor(task.status)
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
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "60px",
    fontSize: "16px"
  },
  error: {
    color: "#f87171",
    padding: "20px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: "8px",
    margin: "32px auto",
    maxWidth: "800px"
  },
  header: {
    marginBottom: "28px"
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 6px 0"
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "32px"
  },
  metricCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  metricIconBox: (color: string) => ({
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: `${color}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }),
  metricValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc"
  },
  metricLabel: {
    fontSize: "13px",
    color: "#94a3b8"
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "24px"
  },
  sectionCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "22px"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    borderBottom: "1px solid #334155",
    paddingBottom: "12px"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  emptyText: {
    color: "#64748b",
    fontSize: "14px",
    fontStyle: "italic",
    padding: "20px 0"
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  taskItem: {
    backgroundColor: "#0f172a",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #334155"
  },
  taskTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px"
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#e2e8f0"
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "4px",
    textTransform: "uppercase"
  },
  taskDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "8px 0 0 0"
  }
};
