import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { TaskResponseDTO, TaskStatus } from "../../types/api.types";
import { Plus, Trash2, Tag, CheckCircle2, Clock, CircleDot, X } from "lucide-react";

export const PersonalTasksView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("ALL");

  // Create Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [labelsInput, setLabelsInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Label Modal
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState<string>("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get<TaskResponseDTO[]>("/tasks/personal");
      setTasks(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const labels = labelsInput
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await api.post<TaskResponseDTO>("/tasks/personal", {
        title: title.trim(),
        description: description.trim(),
        labels
      });

      setTasks([res.data, ...tasks]);
      setShowModal(false);
      setTitle("");
      setDescription("");
      setLabelsInput("");
    } catch (err: any) {
      alert(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const res = await api.patch<TaskResponseDTO>(`/tasks/${taskId}/status`, { status });
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !newLabel.trim()) return;

    try {
      const res = await api.post<TaskResponseDTO>(`/tasks/${selectedTaskId}/labels`, {
        label: newLabel.trim()
      });
      setTasks(tasks.map((t) => (t.id === selectedTaskId ? res.data : t)));
      setNewLabel("");
      setSelectedTaskId(null);
    } catch (err: any) {
      alert(err.message || "Failed to add label");
    }
  };

  const handleRemoveLabel = async (taskId: string, label: string) => {
    try {
      const res = await api.delete<TaskResponseDTO>(`/tasks/${taskId}/labels/${encodeURIComponent(label)}`);
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err: any) {
      alert(err.message || "Failed to remove label");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.heading}>Personal Tasks</h1>
          <p style={styles.subheading}>Manage your standalone tasks and free-form tags</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.createBtn}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        {["ALL", "TODO", "IN_PROGRESS", "COMPLETED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            style={{
              ...styles.filterBtn,
              ...(filter === st ? styles.activeFilter : {})
            }}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.statusMsg}>Loading tasks...</div>
      ) : error ? (
        <div style={styles.errorMsg}>{error}</div>
      ) : filteredTasks.length === 0 ? (
        <div style={styles.emptyState}>No tasks found matching this filter.</div>
      ) : (
        <div style={styles.taskList}>
          {filteredTasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{task.title}</h3>
                <div style={styles.cardActions}>
                  <button
                    onClick={() => setSelectedTaskId(task.id)}
                    style={styles.iconBtn}
                    title="Add Label"
                  >
                    <Tag size={16} color="#94a3b8" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={styles.deleteBtn}
                    title="Delete Task"
                  >
                    <Trash2 size={16} color="#f87171" />
                  </button>
                </div>
              </div>

              {task.description && <p style={styles.cardDesc}>{task.description}</p>}

              {/* Labels */}
              <div style={styles.labelRow}>
                {task.labels.map((lbl) => (
                  <span key={lbl} style={styles.labelBadge}>
                    #{lbl}
                    <X
                      size={12}
                      style={{ cursor: "pointer", marginLeft: 4 }}
                      onClick={() => handleRemoveLabel(task.id, lbl)}
                    />
                  </span>
                ))}
              </div>

              {/* Status Switcher Buttons */}
              <div style={styles.statusSwitchRow}>
                <span style={styles.statusLabel}>Status:</span>
                <div style={styles.statusButtons}>
                  <button
                    onClick={() => handleStatusChange(task.id, "TODO")}
                    style={{
                      ...styles.statusBtn,
                      ...(task.status === "TODO" ? styles.statusBtnActive("#f59e0b") : {})
                    }}
                  >
                    <CircleDot size={14} /> Todo
                  </button>
                  <button
                    onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                    style={{
                      ...styles.statusBtn,
                      ...(task.status === "IN_PROGRESS" ? styles.statusBtnActive("#38bdf8") : {})
                    }}
                  >
                    <Clock size={14} /> In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(task.id, "COMPLETED")}
                    style={{
                      ...styles.statusBtn,
                      ...(task.status === "COMPLETED" ? styles.statusBtnActive("#22c55e") : {})
                    }}
                  >
                    <CheckCircle2 size={14} /> Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create Personal Task</h2>
              <X size={20} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleCreate} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Design user interface"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Description</label>
                <textarea
                  placeholder="Additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...styles.modalInput, height: "80px", resize: "vertical" }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Labels (comma separated)</label>
                <input
                  type="text"
                  placeholder="bug, urgent, research"
                  value={labelsInput}
                  onChange={(e) => setLabelsInput(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={styles.saveBtn}>
                  {submitting ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Label Modal */}
      {selectedTaskId && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: "360px" }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Tag</h2>
              <X size={20} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSelectedTaskId(null)} />
            </div>
            <form onSubmit={handleAddLabel} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. priority"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  style={styles.modalInput}
                  required
                  autoFocus
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setSelectedTaskId(null)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  Add Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, any> = {
  container: {
    padding: "36px 40px",
    maxWidth: "1000px",
    margin: "0 auto"
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px"
  },
  heading: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.5px",
    margin: "0 0 6px 0"
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "28px"
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)"
  },
  activeFilter: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "600"
  },
  statusMsg: {
    color: "#64748b",
    textAlign: "center",
    padding: "48px",
    fontSize: "15px"
  },
  errorMsg: {
    color: "#b91c1c",
    padding: "16px 20px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px"
  },
  emptyState: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "48px",
    fontStyle: "italic",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    border: "1px dashed #cbd5e1"
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  taskCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0
  },
  cardActions: {
    display: "flex",
    gap: "6px"
  },
  iconBtn: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "6px 8px",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center"
  },
  deleteBtn: {
    background: "#fff5f5",
    border: "1px solid #fee2e2",
    padding: "6px 8px",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center"
  },
  cardDesc: {
    fontSize: "14px",
    color: "#475569",
    margin: "10px 0",
    lineHeight: "1.4"
  },
  labelRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: "12px 0"
  },
  labelBadge: {
    fontSize: "12px",
    backgroundColor: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    padding: "3px 9px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: "500"
  },
  statusSwitchRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "14px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "14px"
  },
  statusLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600"
  },
  statusButtons: {
    display: "flex",
    gap: "8px"
  },
  statusBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer"
  },
  statusBtnActive: (color: string) => ({
    borderColor: color === "#f59e0b" ? "#fde68a" : color === "#38bdf8" ? "#bfdbfe" : "#a7f3d0",
    backgroundColor: color === "#f59e0b" ? "#fffbeb" : color === "#38bdf8" ? "#eff6ff" : "#ecfdf5",
    color: color === "#f59e0b" ? "#d97706" : color === "#38bdf8" ? "#2563eb" : "#059669",
    fontWeight: "600"
  }),
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalContent: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    padding: "28px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  inputLabel: {
    fontSize: "13px",
    color: "#334155",
    fontWeight: "600"
  },
  modalInput: {
    padding: "11px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "12px"
  },
  cancelBtn: {
    padding: "9px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer"
  },
  saveBtn: {
    padding: "9px 18px",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
  }
};
