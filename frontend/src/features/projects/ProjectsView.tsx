import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../auth/AuthContext";
import type { ProjectResponseDTO, TaskResponseDTO, TaskStatus } from "../../types/api.types";
import {
  Plus,
  Crown,
  Users,
  CheckCircle2,
  Clock,
  CircleDot,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  Trash2,
  Tag,
  ArrowLeft,
  X
} from "lucide-react";

export const ProjectsView: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Create Project Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Selected Project Details & Tasks
  const [selectedProject, setSelectedProject] = useState<ProjectResponseDTO | null>(null);
  const [projectTasks, setProjectTasks] = useState<TaskResponseDTO[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);

  // Modals for Selected Project
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [memberUsername, setMemberUsername] = useState<string>("");
  const [memberLabel, setMemberLabel] = useState<string>("");

  const [showTransferHost, setShowTransferHost] = useState<boolean>(false);
  const [newHostId, setNewHostId] = useState<string>("");

  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");
  const [taskLabels, setTaskLabels] = useState<string>("");
  const [taskAssignee, setTaskAssignee] = useState<string>("");

  // Edit Label Modal
  const [editLabelUser, setEditLabelUser] = useState<string | null>(null);
  const [editLabelText, setEditLabelText] = useState<string>("");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get<ProjectResponseDTO[]>("/projects");
      setProjects(res.data);
    } catch (err: any) {
      alert(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    setTasksLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get<ProjectResponseDTO>(`/projects/${projectId}`),
        api.get<TaskResponseDTO[]>(`/tasks/projects/${projectId}`)
      ]);
      setSelectedProject(projRes.data);
      setProjectTasks(tasksRes.data);
    } catch (err: any) {
      alert(err.message || "Failed to load project details");
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post<ProjectResponseDTO>("/projects", {
        title: newTitle.trim(),
        description: newDescription.trim()
      });
      setProjects([res.data, ...projects]);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setSelectedProjectId(res.data.id);
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
      setSelectedProjectId(null);
      setSelectedProject(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  };

  // --- Member Actions ---

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !memberUsername.trim()) return;

    try {
      const res = await api.post<ProjectResponseDTO>(`/projects/${selectedProjectId}/members`, {
        username: memberUsername.trim(),
        label: memberLabel.trim() || undefined
      });
      setSelectedProject(res.data);
      setShowAddMember(false);
      setMemberUsername("");
      setMemberLabel("");
    } catch (err: any) {
      alert(err.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!selectedProjectId) return;
    const isSelf = user?.id === targetUserId;
    const confirmMsg = isSelf
      ? "Are you sure you want to leave this project?"
      : "Are you sure you want to remove this member?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.delete<ProjectResponseDTO>(`/projects/${selectedProjectId}/members/${targetUserId}`);
      if (isSelf) {
        setSelectedProjectId(null);
        setSelectedProject(null);
        fetchProjects();
      } else {
        setSelectedProject(res.data);
        // Reload tasks because tasks assigned to that member are now unassigned!
        loadProjectDetails(selectedProjectId);
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newHostId) return;

    if (!window.confirm("Are you sure you want to transfer Host ownership? You will become a regular member.")) return;

    try {
      const res = await api.post<ProjectResponseDTO>(`/projects/${selectedProjectId}/transfer-host`, {
        newHostId
      });
      setSelectedProject(res.data);
      setShowTransferHost(false);
      setNewHostId("");
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Failed to transfer ownership");
    }
  };

  const handleUpdateResponsibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !editLabelUser) return;

    try {
      const res = await api.patch<ProjectResponseDTO>(
        `/projects/${selectedProjectId}/members/${editLabelUser}/label`,
        { label: editLabelText.trim() || undefined }
      );
      setSelectedProject(res.data);
      setEditLabelUser(null);
      setEditLabelText("");
    } catch (err: any) {
      alert(err.message || "Failed to update label");
    }
  };

  // --- Project Task Actions ---

  const handleCreateProjectTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !taskTitle.trim()) return;

    try {
      const labels = taskLabels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await api.post<TaskResponseDTO>(`/tasks/projects/${selectedProjectId}`, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        labels,
        assignedToUserId: taskAssignee || null
      });

      setProjectTasks([res.data, ...projectTasks]);
      setShowCreateTask(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskLabels("");
      setTaskAssignee("");
    } catch (err: any) {
      alert(err.message || "Failed to create project task");
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const res = await api.patch<TaskResponseDTO>(`/tasks/${taskId}/status`, { status });
      setProjectTasks(projectTasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleAssignTask = async (taskId: string, memberId: string) => {
    try {
      let res: { data: TaskResponseDTO };
      if (!memberId) {
        res = await api.patch<TaskResponseDTO>(`/tasks/${taskId}/unassign`);
      } else {
        res = await api.patch<TaskResponseDTO>(`/tasks/${taskId}/assign`, { assignedToUserId: memberId });
      }
      setProjectTasks(projectTasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err: any) {
      alert(err.message || "Failed to assign task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this project task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setProjectTasks(projectTasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || "Failed to delete task");
    }
  };

  const isHost = selectedProject?.hostId === user?.id;

  // --- Render Project Detail View ---
  if (selectedProject) {
    return (
      <div style={styles.container}>
        <button onClick={() => setSelectedProjectId(null)} style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div style={styles.projectHeader}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={styles.projectTitle}>{selectedProject.title}</h1>
              {isHost && (
                <span style={styles.hostBadge}>
                  <Crown size={14} /> HOST
                </span>
              )}
            </div>
            {selectedProject.description && (
              <p style={styles.projectDesc}>{selectedProject.description}</p>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {isHost && (
              <>
                <button onClick={() => setShowTransferHost(true)} style={styles.secondaryBtn}>
                  <ArrowRightLeft size={16} /> Transfer Ownership
                </button>
                <button onClick={() => handleDeleteProject(selectedProject.id)} style={styles.dangerBtn}>
                  <Trash2 size={16} /> Delete Project
                </button>
              </>
            )}
            {!isHost && (
              <button onClick={() => handleRemoveMember(user?.id || "")} style={styles.dangerBtn}>
                Leave Project
              </button>
            )}
          </div>
        </div>

        {/* Members Roster Section */}
        <div style={styles.membersCard}>
          <div style={styles.membersHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} color="#38bdf8" />
              <h2 style={styles.cardSectionTitle}>
                Project Members ({selectedProject.members.length})
              </h2>
            </div>
            {isHost && (
              <button onClick={() => setShowAddMember(true)} style={styles.smallPrimaryBtn}>
                <UserPlus size={14} /> Add Member
              </button>
            )}
          </div>

          <div style={styles.memberGrid}>
            {selectedProject.members.map((m) => {
              const isMemberHost = m.userId === selectedProject.hostId;
              const isCurrentUser = m.userId === user?.id;

              return (
                <div key={m.userId} style={styles.memberItem}>
                  <div style={styles.memberInfoRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isMemberHost && <Crown size={15} color="#f59e0b" />}
                      <span style={styles.memberUserId}>
                        {isCurrentUser ? `@you (${m.userId.substring(0, 8)})` : `@user-${m.userId.substring(0, 8)}`}
                      </span>
                    </div>

                    {/* Member Responsibility Label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {m.label ? (
                        <span style={styles.respBadge}>{m.label}</span>
                      ) : (
                        <span style={styles.noLabel}>No label</span>
                      )}

                      {isHost && (
                        <button
                          onClick={() => {
                            setEditLabelUser(m.userId);
                            setEditLabelText(m.label || "");
                          }}
                          style={styles.labelEditBtn}
                          title="Edit Responsibility Label"
                        >
                          <Tag size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Remove button (Host removing someone else) */}
                  {isHost && !isMemberHost && (
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      style={styles.removeMemberBtn}
                      title="Remove Member"
                    >
                      <UserMinus size={14} color="#f87171" /> Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Tasks Section */}
        <div style={styles.tasksSection}>
          <div style={styles.tasksHeader}>
            <div>
              <h2 style={styles.cardSectionTitle}>Project Tasks</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>
                {isHost
                  ? "As Host, you can create, assign, and manage all tasks."
                  : "As Member, you can update the status of tasks assigned to you."}
              </p>
            </div>
            {isHost && (
              <button onClick={() => setShowCreateTask(true)} style={styles.primaryBtn}>
                <Plus size={16} /> New Project Task
              </button>
            )}
          </div>

          {tasksLoading ? (
            <div style={styles.statusMsg}>Loading project tasks...</div>
          ) : projectTasks.length === 0 ? (
            <div style={styles.emptyCard}>No tasks created for this project yet.</div>
          ) : (
            <div style={styles.taskList}>
              {projectTasks.map((task) => {
                const isAssignee = task.assignedToUserId === user?.id;
                const canChangeStatus = isHost || isAssignee;

                return (
                  <div key={task.id} style={styles.taskCard}>
                    <div style={styles.taskCardTop}>
                      <div>
                        <h3 style={styles.taskCardTitle}>{task.title}</h3>
                        {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                      </div>
                      {isHost && (
                        <button onClick={() => handleDeleteTask(task.id)} style={styles.iconBtn} title="Delete Task">
                          <Trash2 size={16} color="#f87171" />
                        </button>
                      )}
                    </div>

                    {/* Labels */}
                    <div style={styles.labelRow}>
                      {task.labels.map((lbl) => (
                        <span key={lbl} style={styles.labelBadge}>
                          #{lbl}
                        </span>
                      ))}
                    </div>

                    <div style={styles.taskFooter}>
                      {/* Assignee Control */}
                      <div style={styles.assigneeBox}>
                        <span style={styles.footerLabel}>Assignee:</span>
                        {isHost ? (
                          <select
                            value={task.assignedToUserId || ""}
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                            style={styles.assignSelect}
                          >
                            <option value="">-- Unassigned --</option>
                            {selectedProject.members.map((m) => (
                              <option key={m.userId} value={m.userId}>
                                @user-{m.userId.substring(0, 8)} {m.label ? `(${m.label})` : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={styles.assigneeDisplay}>
                            {task.assignedToUserId
                              ? task.assignedToUserId === user?.id
                                ? "Assigned to You"
                                : `@user-${task.assignedToUserId.substring(0, 8)}`
                              : "Unassigned"}
                          </span>
                        )}
                      </div>

                      {/* Status Buttons */}
                      <div style={styles.statusBox}>
                        <span style={styles.footerLabel}>Status:</span>
                        <div style={styles.statusButtons}>
                          {(["TODO", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map((st) => {
                            const isActive = task.status === st;
                            return (
                              <button
                                key={st}
                                disabled={!canChangeStatus}
                                onClick={() => handleStatusChange(task.id, st)}
                                style={{
                                  ...styles.statusBtn,
                                  ...(isActive ? styles.statusBtnActive(st) : {}),
                                  ...(!canChangeStatus ? { opacity: 0.5, cursor: "not-allowed" } : {})
                                }}
                              >
                                {st === "TODO" && <CircleDot size={13} />}
                                {st === "IN_PROGRESS" && <Clock size={13} />}
                                {st === "COMPLETED" && <CheckCircle2 size={13} />}
                                {st.replace("_", " ")}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Add Member */}
        {showAddMember && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Add Project Member</h3>
                <X size={18} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setShowAddMember(false)} />
              </div>
              <form onSubmit={handleAddMember} style={styles.modalForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Username *</label>
                  <input
                    type="text"
                    placeholder="Enter registered username"
                    value={memberUsername}
                    onChange={(e) => setMemberUsername(e.target.value)}
                    style={styles.modalInput}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Responsibility Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Developer, QA Specialist"
                    value={memberLabel}
                    onChange={(e) => setMemberLabel(e.target.value)}
                    style={styles.modalInput}
                  />
                  <small style={{ color: "#64748b", fontSize: "11px" }}>
                    Descriptive tag only; does not grant Host authority.
                  </small>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowAddMember(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Transfer Host */}
        {showTransferHost && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Transfer Host Ownership</h3>
                <X size={18} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setShowTransferHost(false)} />
              </div>
              <form onSubmit={handleTransferOwnership} style={styles.modalForm}>
                <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 12px 0" }}>
                  Select an existing project member to transfer ownership to. You will become a regular member.
                </p>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>New Host Member</label>
                  <select
                    value={newHostId}
                    onChange={(e) => setNewHostId(e.target.value)}
                    style={styles.modalInput}
                    required
                  >
                    <option value="">-- Choose Member --</option>
                    {selectedProject.members
                      .filter((m) => m.userId !== user?.id)
                      .map((m) => (
                        <option key={m.userId} value={m.userId}>
                          @user-{m.userId.substring(0, 8)} {m.label ? `(${m.label})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowTransferHost(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={{ ...styles.primaryBtn, backgroundColor: "#f59e0b" }}>
                    Confirm Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Responsibility Label */}
        {editLabelUser && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Edit Member Responsibility Label</h3>
                <X size={18} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setEditLabelUser(null)} />
              </div>
              <form onSubmit={handleUpdateResponsibility} style={styles.modalForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Responsibility Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Architect, QA, Reviewer"
                    value={editLabelText}
                    onChange={(e) => setEditLabelText(e.target.value)}
                    style={styles.modalInput}
                  />
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setEditLabelUser(null)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Save Label
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Project Task */}
        {showCreateTask && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Create Project Task</h3>
                <X size={18} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setShowCreateTask(false)} />
              </div>
              <form onSubmit={handleCreateProjectTask} style={styles.modalForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Title *</label>
                  <input
                    type="text"
                    placeholder="Task summary"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    style={styles.modalInput}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Description</label>
                  <textarea
                    placeholder="Details..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    style={{ ...styles.modalInput, height: "70px" }}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Labels (comma separated)</label>
                  <input
                    type="text"
                    placeholder="frontend, api, bug"
                    value={taskLabels}
                    onChange={(e) => setTaskLabels(e.target.value)}
                    style={styles.modalInput}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Assign to Member (Optional)</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    style={styles.modalInput}
                  >
                    <option value="">-- Leave Unassigned --</option>
                    {selectedProject.members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        @user-{m.userId.substring(0, 8)} {m.label ? `(${m.label})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowCreateTask(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render Projects List View ---
  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.heading}>Projects</h1>
          <p style={styles.subheading}>Collaborative workspaces and team project task boards</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={styles.primaryBtn}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {loading ? (
        <div style={styles.statusMsg}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={styles.emptyCard}>
          You are not part of any projects yet. Click "New Project" to create one as Host!
        </div>
      ) : (
        <div style={styles.projectGrid}>
          {projects.map((proj) => {
            const userIsHost = proj.hostId === user?.id;

            return (
              <div
                key={proj.id}
                style={styles.projectCard}
                onClick={() => setSelectedProjectId(proj.id)}
              >
                <div style={styles.cardHeaderRow}>
                  <h3 style={styles.cardProjectTitle}>{proj.title}</h3>
                  {userIsHost ? (
                    <span style={styles.hostBadge}>
                      <Crown size={12} /> Host
                    </span>
                  ) : (
                    <span style={styles.memberBadge}>Member</span>
                  )}
                </div>
                <p style={styles.cardProjectDesc}>{proj.description || "No description provided."}</p>
                <div style={styles.cardFooter}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: "13px" }}>
                    <Users size={14} /> {proj.members.length} member{proj.members.length !== 1 ? "s" : ""}
                  </div>
                  <span style={{ color: "#38bdf8", fontSize: "13px", fontWeight: "600" }}>Open Board →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Project</h3>
              <X size={18} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setShowCreateModal(false)} />
            </div>
            <form onSubmit={handleCreateProject} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={styles.modalInput}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Description</label>
                <textarea
                  placeholder="Project purpose..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ ...styles.modalInput, height: "80px" }}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={styles.primaryBtn}>
                  {submitting ? "Creating..." : "Create Project"}
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
    maxWidth: "1200px",
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
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #0284c7",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer"
  },
  dangerBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #ef4444",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer"
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "16px"
  },
  projectHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "24px"
  },
  projectTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0
  },
  projectDesc: {
    color: "#cbd5e1",
    fontSize: "14px",
    margin: "8px 0 0 0"
  },
  hostBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#f59e0b",
    border: "1px solid #f59e0b",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  memberBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#334155",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  membersCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "28px"
  },
  membersHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    borderBottom: "1px solid #334155",
    paddingBottom: "12px"
  },
  cardSectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  smallPrimaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px"
  },
  memberItem: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  memberInfoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  memberUserId: {
    fontSize: "13px",
    color: "#f8fafc",
    fontWeight: "500"
  },
  respBadge: {
    fontSize: "11px",
    backgroundColor: "#1e3a8a",
    color: "#93c5fd",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  noLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontStyle: "italic"
  },
  labelEditBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "2px"
  },
  removeMemberBtn: {
    alignSelf: "flex-end",
    background: "transparent",
    border: "none",
    color: "#f87171",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  tasksSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  tasksHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statusMsg: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px"
  },
  emptyCard: {
    backgroundColor: "#1e293b",
    border: "1px dashed #334155",
    color: "#64748b",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
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
  taskCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  taskCardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: "0 0 4px 0"
  },
  taskDesc: {
    fontSize: "13px",
    color: "#cbd5e1",
    margin: "4px 0"
  },
  labelRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: "8px 0"
  },
  labelBadge: {
    fontSize: "11px",
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    border: "1px solid #1e40af",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  taskFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #334155",
    paddingTop: "12px",
    marginTop: "12px",
    flexWrap: "wrap",
    gap: "12px"
  },
  assigneeBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  footerLabel: {
    fontSize: "12px",
    color: "#64748b"
  },
  assignSelect: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    outline: "none"
  },
  assigneeDisplay: {
    fontSize: "12px",
    color: "#93c5fd",
    fontWeight: "500",
    backgroundColor: "#172554",
    padding: "3px 8px",
    borderRadius: "4px"
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  statusButtons: {
    display: "flex",
    gap: "6px"
  },
  statusBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer"
  },
  statusBtnActive: (status: TaskStatus) => {
    let color = "#f59e0b";
    if (status === "IN_PROGRESS") color = "#38bdf8";
    if (status === "COMPLETED") color = "#22c55e";
    return {
      borderColor: color,
      backgroundColor: `${color}15`,
      color: color,
      fontWeight: "600"
    };
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px"
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px"
  },
  projectCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "border-color 0.2s"
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  cardProjectTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  cardProjectDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.4",
    margin: "0 0 16px 0",
    minHeight: "36px"
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #334155",
    paddingTop: "12px"
  },
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
    maxWidth: "460px",
    padding: "24px"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px"
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
    marginTop: "8px"
  },
  cancelBtn: {
    padding: "8px 14px",
    backgroundColor: "transparent",
    border: "1px solid #475569",
    borderRadius: "6px",
    color: "#cbd5e1",
    fontSize: "14px",
    cursor: "pointer"
  }
};
