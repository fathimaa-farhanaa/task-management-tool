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
    padding: "32px",
    maxWidth: "1000px",
    margin: "0 auto"
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px"
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 6px 0"
  },
  subheading: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer"
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px"
  },
  filterBtn: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer"
  },
  activeFilter: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#ffffff"
  },
  statusMsg: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px"
  },
  errorMsg: {
    color: "#f87171",
    padding: "16px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: "8px"
  },
  emptyState: {
    color: "#64748b",
    textAlign: "center",
    padding: "40px",
    fontStyle: "italic"
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  taskCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "18px"
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
    color: "#f8fafc",
    margin: 0
  },
  cardActions: {
    display: "flex",
    gap: "6px"
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    borderRadius: "4px"
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    borderRadius: "4px"
  },
  cardDesc: {
    fontSize: "14px",
    color: "#cbd5e1",
    margin: "8px 0"
  },
  labelRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: "10px 0"
  },
  labelBadge: {
    fontSize: "12px",
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    border: "1px solid #1e40af",
    padding: "3px 8px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  statusSwitchRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "12px",
    borderTop: "1px solid #334155",
    paddingTop: "12px"
  },
  statusLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500"
  },
  statusButtons: {
    display: "flex",
    gap: "6px"
  },
  statusBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer"
  },
  statusBtnActive: (color: string) => ({
    borderColor: color,
    backgroundColor: `${color}15`,
    color: color,
    fontWeight: "600"
  }),
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalContent: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "480px",
    padding: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  inputLabel: {
    fontSize: "13px",
    color: "#cbd5e1",
    fontWeight: "500"
  },
  modalInput: {
    padding: "10px 12px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px"
  },
  cancelBtn: {
    padding: "8px 14px",
    backgroundColor: "transparent",
    border: "1px solid #475569",
    borderRadius: "6px",
    color: "#cbd5e1",
    fontSize: "14px",
    cursor: "pointer"
  },
  saveBtn: {
    padding: "8px 16px",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  }
};
