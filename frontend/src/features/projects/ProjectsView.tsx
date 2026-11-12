import React, { useEffect, useState, useRef } from "react";
import { api } from "../../services/api";
import { useAuth } from "../auth/AuthContext";
import type { ProjectResponseDTO, TaskResponseDTO, TaskStatus, UserResponseDTO } from "../../types/api.types";
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
  X,
  Search,
  Check,
  Loader2
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

  // Multi-Select Member Search Modal State
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserResponseDTO[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserResponseDTO[]>([]);
  const [memberLabel, setMemberLabel] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAddingMembers, setIsAddingMembers] = useState<boolean>(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Transfer Host Modal
  const [showTransferHost, setShowTransferHost] = useState<boolean>(false);
  const [newHostId, setNewHostId] = useState<string>("");

  // Create Task Modal
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

  // Debounced live user search for Add Member modal
  useEffect(() => {
    if (!showAddMember) {
      setSearchQuery("");
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await api.get<UserResponseDTO[]>("/users/search", {
          params: { q: trimmed }
        });
        setSearchResults(res.data);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error("User search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, showAddMember]);

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

  const handleToggleSelectUser = (targetUser: UserResponseDTO) => {
    if (selectedUsers.some((u) => u.id === targetUser.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== targetUser.id));
    } else {
      setSelectedUsers([...selectedUsers, targetUser]);
    }
  };

  const handleRemoveSelectedChip = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleAddSelectedMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || selectedUsers.length === 0) return;

    setIsAddingMembers(true);
    setAddMemberError(null);

    try {
      // Add each selected user in parallel
      for (const targetUser of selectedUsers) {
        await api.post<ProjectResponseDTO>(`/projects/${selectedProjectId}/members`, {
          username: targetUser.username,
          label: memberLabel.trim() || undefined
        });
      }

      await loadProjectDetails(selectedProjectId);
      setShowAddMember(false);
      setSelectedUsers([]);
      setSearchQuery("");
      setMemberLabel("");
    } catch (err: any) {
      setAddMemberError(err.message || "Failed to add one or more members");
    } finally {
      setIsAddingMembers(false);
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

  const getUserDisplayName = (userId: string | null | undefined): string => {
    if (!userId) return "Unassigned";
    if (userId === user?.id) return `Assigned to You (@${user?.username || "you"})`;
    const found = selectedProject?.members.find((m) => m.userId === userId);
    if (found?.username) return `@${found.username}`;
    return `@user-${userId.substring(0, 8)}`;
  };

  // --- Render Project Detail View ---
  if (selectedProject) {
    return (
      <div style={styles.container}>
        <button onClick={() => setSelectedProjectId(null)} style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div style={styles.projectHeaderCard}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isHost && (
              <>
                <button onClick={() => setShowTransferHost(true)} style={styles.secondaryBtn}>
                  <ArrowRightLeft size={15} /> Transfer Ownership
                </button>
                <button onClick={() => handleDeleteProject(selectedProject.id)} style={styles.dangerBtn}>
                  <Trash2 size={15} /> Delete Project
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
        <div style={styles.cardSection}>
          <div style={styles.sectionHeaderRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={20} color="#2563eb" />
              <h2 style={styles.sectionTitle}>
                Project Members ({selectedProject.members.length})
              </h2>
            </div>
            {isHost && (
              <button
                onClick={() => {
                  setSelectedUsers([]);
                  setSearchQuery("");
                  setMemberLabel("");
                  setAddMemberError(null);
                  setShowAddMember(true);
                }}
                style={styles.primaryBtn}
              >
                <UserPlus size={16} /> Add Members
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={styles.avatarMini}>
                        {isMemberHost ? <Crown size={14} color="#d97706" /> : <Users size={14} color="#2563eb" />}
                      </div>
                      <div>
                        <div style={styles.memberUserId}>
                          {isCurrentUser
                            ? `@you (${user?.username || m.username || m.userId.substring(0, 8)})`
                            : m.username
                            ? `@${m.username}`
                            : `@user-${m.userId.substring(0, 8)}`}
                        </div>
                        {isMemberHost && <span style={styles.hostSubText}>Project Host</span>}
                      </div>
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
                      <UserMinus size={14} /> Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Tasks Section */}
        <div style={styles.cardSection}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h2 style={styles.sectionTitle}>Project Tasks</h2>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
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
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      )}
                    </div>

                    {/* Labels */}
                    {task.labels.length > 0 && (
                      <div style={styles.labelRow}>
                        {task.labels.map((lbl) => (
                          <span key={lbl} style={styles.labelBadge}>
                            #{lbl}
                          </span>
                        ))}
                      </div>
                    )}

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
                                {m.userId === user?.id
                                  ? `@you (${user?.username || m.username || m.userId.substring(0, 8)})`
                                  : m.username
                                  ? `@${m.username}`
                                  : `@user-${m.userId.substring(0, 8)}`}{" "}
                                {m.label ? `(${m.label})` : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={styles.assigneeDisplay}>
                            {getUserDisplayName(task.assignedToUserId)}
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

        {/* MODAL: Add Member (Live Search & Multi-Select) */}
        {showAddMember && (
          <div
            style={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddMember(false);
                setIsDropdownOpen(false);
              }
            }}
          >
            <div style={{ ...styles.modalContent, maxWidth: "560px" }}>
              <div style={styles.modalHeader}>
                <div>
                  <h3 style={styles.modalTitle}>Add Project Members</h3>
                  <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                    Search registered users by username or email and select one or multiple to add.
                  </p>
                </div>
                <X
                  size={20}
                  color="#64748b"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowAddMember(false);
                    setIsDropdownOpen(false);
                  }}
                />
              </div>

              {addMemberError && (
                <div style={styles.errorBox}>
                  {addMemberError}
                </div>
              )}

              <form onSubmit={handleAddSelectedMembers} style={styles.modalForm}>
                {/* Selected Users Chips Container */}
                <div>
                  <label style={styles.inputLabel}>
                    Selected Members ({selectedUsers.length})
                  </label>
                  {selectedUsers.length === 0 ? (
                    <div style={styles.emptyChipsBox}>
                      No users selected yet. Search below to pick members.
                    </div>
                  ) : (
                    <div style={styles.chipsContainer}>
                      {selectedUsers.map((u) => (
                        <span key={u.id} style={styles.userChip}>
                          <span style={styles.chipName}>@{u.username}</span>
                          <span style={styles.chipEmail}>({u.email})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedChip(u.id)}
                            style={styles.chipRemoveBtn}
                            title="Remove"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Search Input with Dropdown */}
                <div style={styles.searchSection} ref={searchContainerRef}>
                  <label style={styles.inputLabel}>Search Users by Username or Email</label>
                  <div style={styles.searchInputWrapper}>
                    <Search size={16} color="#94a3b8" style={{ marginLeft: 12, flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Type username or email (e.g. alex, john@...)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim().length > 0) {
                          setIsDropdownOpen(true);
                        }
                      }}
                      style={styles.searchInput}
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 size={16} color="#2563eb" style={{ marginRight: 12, animation: "spin 1s linear infinite" }} />
                    )}
                  </div>

                  {/* Search Dropdown Results */}
                  {isDropdownOpen && searchQuery.trim().length > 0 && (
                    <div style={styles.dropdownBox}>
                      {searchResults.length === 0 ? (
                        <div style={styles.dropdownEmpty}>
                          {isSearching ? "Searching users..." : `No users found matching "${searchQuery}"`}
                        </div>
                      ) : (
                        <div style={styles.dropdownList}>
                          {searchResults.map((su) => {
                            const isAlreadyMember = selectedProject.members.some((m) => m.userId === su.id);
                            const isSelected = selectedUsers.some((u) => u.id === su.id);

                            return (
                              <div
                                key={su.id}
                                onClick={() => {
                                  if (!isAlreadyMember) {
                                    handleToggleSelectUser(su);
                                  }
                                }}
                                style={{
                                  ...styles.dropdownItem,
                                  ...(isAlreadyMember ? styles.dropdownItemDisabled : {}),
                                  ...(isSelected ? styles.dropdownItemSelected : {})
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={styles.dropdownAvatar}>
                                    {su.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={styles.dropdownUsername}>@{su.username}</div>
                                    <div style={styles.dropdownEmail}>{su.email}</div>
                                  </div>
                                </div>

                                <div>
                                  {isAlreadyMember ? (
                                    <span style={styles.alreadyMemberTag}>Already Member</span>
                                  ) : isSelected ? (
                                    <span style={styles.selectedTag}>
                                      <Check size={13} style={{ marginRight: 3 }} /> Selected
                                    </span>
                                  ) : (
                                    <span style={styles.selectActionTag}>+ Select</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Responsibility Label for the batch */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Responsibility Label (Optional for selected)</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Dev, QA, Designer"
                    value={memberLabel}
                    onChange={(e) => setMemberLabel(e.target.value)}
                    style={styles.modalInput}
                  />
                  <small style={{ color: "#64748b", fontSize: "12px", marginTop: 2 }}>
                    Applied to all selected members. Does not grant Host privileges.
                  </small>
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(false);
                      setSelectedUsers([]);
                      setSearchQuery("");
                      setIsDropdownOpen(false);
                    }}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedUsers.length === 0 || isAddingMembers}
                    style={{
                      ...styles.primaryBtn,
                      ...((selectedUsers.length === 0 || isAddingMembers) ? { opacity: 0.5, cursor: "not-allowed" } : {})
                    }}
                  >
                    {isAddingMembers
                      ? "Adding Members..."
                      : selectedUsers.length > 1
                      ? `Add ${selectedUsers.length} Members`
                      : selectedUsers.length === 1
                      ? "Add 1 Member"
                      : "Add Members"}
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
                <X size={18} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setShowTransferHost(false)} />
              </div>
              <form onSubmit={handleTransferOwnership} style={styles.modalForm}>
                <p style={{ color: "#475569", fontSize: "13px", margin: "0 0 12px 0" }}>
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
                          {m.username ? `@${m.username}` : `@user-${m.userId.substring(0, 8)}`}{" "}
                          {m.label ? `(${m.label})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowTransferHost(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={{ ...styles.primaryBtn, backgroundColor: "#d97706" }}>
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
                <X size={18} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setEditLabelUser(null)} />
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
                <X size={18} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setShowCreateTask(false)} />
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
                        {m.userId === user?.id
                          ? `@you (${user?.username || m.username || m.userId.substring(0, 8)})`
                          : m.username
                          ? `@${m.username}`
                          : `@user-${m.userId.substring(0, 8)}`}{" "}
                        {m.label ? `(${m.label})` : ""}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "13px" }}>
                    <Users size={15} color="#2563eb" /> {proj.members.length} member{proj.members.length !== 1 ? "s" : ""}
                  </div>
                  <span style={{ color: "#2563eb", fontSize: "13px", fontWeight: "600" }}>Open Board →</span>
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
              <X size={18} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setShowCreateModal(false)} />
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
    padding: "36px 40px",
    maxWidth: "1200px",
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
  primaryBtn: {
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
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    transition: "background-color 0.15s ease, transform 0.1s ease"
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #bfdbfe",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer"
  },
  dangerBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#fff5f5",
    color: "#ef4444",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #fee2e2",
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
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "20px"
  },
  projectHeaderCard: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "28px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "26px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
  },
  projectTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0
  },
  projectDesc: {
    color: "#475569",
    fontSize: "14px",
    margin: "8px 0 0 0",
    lineHeight: "1.5"
  },
  hostBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#fffbeb",
    color: "#d97706",
    border: "1px solid #fde68a",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  memberBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  cardSection: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "28px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px"
  },
  memberItem: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  memberInfoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  avatarMini: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  memberUserId: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: "600"
  },
  hostSubText: {
    fontSize: "11px",
    color: "#d97706",
    fontWeight: "600"
  },
  respBadge: {
    fontSize: "11px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "2px 8px",
    borderRadius: "6px",
    fontWeight: "500"
  },
  noLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontStyle: "italic"
  },
  labelEditBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center"
  },
  removeMemberBtn: {
    alignSelf: "flex-end",
    background: "#fff5f5",
    border: "1px solid #fee2e2",
    color: "#ef4444",
    fontSize: "11px",
    fontWeight: "500",
    borderRadius: "6px",
    padding: "4px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  statusMsg: {
    color: "#64748b",
    textAlign: "center",
    padding: "40px",
    fontSize: "14px"
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    border: "1px dashed #cbd5e1",
    color: "#94a3b8",
    padding: "40px",
    borderRadius: "14px",
    textAlign: "center",
    fontStyle: "italic"
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  taskCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)"
  },
  taskCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  taskCardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 4px 0"
  },
  taskDesc: {
    fontSize: "13px",
    color: "#475569",
    margin: "4px 0",
    lineHeight: "1.4"
  },
  labelRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: "10px 0"
  },
  labelBadge: {
    fontSize: "11px",
    backgroundColor: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    padding: "2px 7px",
    borderRadius: "4px"
  },
  taskFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f1f5f9",
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
    color: "#64748b",
    fontWeight: "500"
  },
  assignSelect: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    outline: "none"
  },
  assigneeDisplay: {
    fontSize: "12px",
    color: "#2563eb",
    fontWeight: "500",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "3px 8px",
    borderRadius: "6px"
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
    padding: "5px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer"
  },
  statusBtnActive: (status: TaskStatus) => {
    if (status === "COMPLETED") {
      return {
        borderColor: "#a7f3d0",
        backgroundColor: "#ecfdf5",
        color: "#059669",
        fontWeight: "600"
      };
    }
    if (status === "IN_PROGRESS") {
      return {
        borderColor: "#bfdbfe",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        fontWeight: "600"
      };
    }
    return {
      borderColor: "#fde68a",
      backgroundColor: "#fffbeb",
      color: "#d97706",
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
    gap: "20px"
  },
  projectCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    cursor: "pointer",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease"
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  cardProjectTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0
  },
  cardProjectDesc: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: "0 0 16px 0",
    minHeight: "38px"
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "14px"
  },
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
    padding: "20px",
    overflowY: "auto"
  },
  modalContent: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    padding: "28px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
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
    gap: "18px"
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
    marginTop: "8px"
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
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "14px"
  },
  // Multi-select & search specific styles
  emptyChipsBox: {
    padding: "10px 14px",
    backgroundColor: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "13px",
    fontStyle: "italic"
  },
  chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    maxHeight: "120px",
    overflowY: "auto",
    padding: "8px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px"
  },
  userChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "12px"
  },
  chipName: {
    fontWeight: "600",
    color: "#1d4ed8"
  },
  chipEmail: {
    color: "#64748b",
    fontSize: "11px"
  },
  chipRemoveBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "1px"
  },
  searchSection: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    position: "relative"
  },
  searchInputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px"
  },
  searchInput: {
    flex: 1,
    padding: "11px 12px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "#0f172a"
  },
  dropdownBox: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    maxHeight: "180px",
    overflowY: "auto",
    zIndex: 100
  },
  dropdownEmpty: {
    padding: "16px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    fontStyle: "italic"
  },
  dropdownList: {
    display: "flex",
    flexDirection: "column"
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    transition: "background-color 0.15s ease"
  },
  dropdownItemDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    backgroundColor: "#f8fafc"
  },
  dropdownItemSelected: {
    backgroundColor: "#eff6ff"
  },
  dropdownAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownUsername: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a"
  },
  dropdownEmail: {
    fontSize: "12px",
    color: "#64748b"
  },
  alreadyMemberTag: {
    fontSize: "11px",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: "4px",
    fontWeight: "500"
  },
  selectedTag: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: "3px 8px",
    borderRadius: "4px",
    fontWeight: "600"
  },
  selectActionTag: {
    fontSize: "12px",
    color: "#2563eb",
    fontWeight: "600",
    padding: "3px 8px"
  }
};
