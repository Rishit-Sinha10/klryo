import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileCode, Download, Upload } from "lucide-react";
import Navbar from "../common/navbar";
import ProjectCard from "../common/projectcard";
import PromptModal from "../ui/PromptModal";
import { useToast } from "../../context/ToastContext";
import useAuth from "../../hooks/useAuth";
import {
  getUserProjectsAPI,
  createProjectAPI,
  deleteProjectAPI,
  updateProjectAPI,
  importProjectsAPI,
} from "../../services/projectAPI";

const GUEST_PROJECTS_KEY = "projects";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const prevSignedInRef = useRef(false);
  const loadingRef = useRef(false);
  const { toast } = useToast();
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const handleAuthChange = async () => {
      if (isSignedIn && !prevSignedInRef.current) {
        prevSignedInRef.current = true;
        await mergeGuestProjects();
      } else {
        prevSignedInRef.current = isSignedIn;
      }
      await loadProjects();
      loadingRef.current = false;
    };
    handleAuthChange();
  }, [isSignedIn]);

  const mergeGuestProjects = async () => {
    const guestProjects =
      JSON.parse(localStorage.getItem(GUEST_PROJECTS_KEY)) || [];
    if (guestProjects.length === 0) return;

    try {
      const toImport = guestProjects.map((p) => ({
        name: p.name,
        description: p.description || "",
        files: (p.files || []).map((f) => ({
          name: f.name,
          content: f.content,
          isMain: f.isMain || false,
        })),
      }));
      await importProjectsAPI(toImport, getToken);
      localStorage.removeItem(GUEST_PROJECTS_KEY);
      toast.success(
        `Merged ${guestProjects.length} local project(s) to your account`,
      );
    } catch (err) {
      console.error(
        "Failed to merge guest projects (backend may be unavailable):",
        err.message,
      );
      toast.info("Local projects kept — will sync when server is available");
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (isSignedIn) {
        const data = await getUserProjectsAPI(getToken);
        setProjects(
          Array.isArray(data.projects)
            ? data.projects
            : Array.isArray(data)
              ? data
              : [],
        );
      } else {
        const saved = JSON.parse(localStorage.getItem(GUEST_PROJECTS_KEY));
        setProjects(Array.isArray(saved) ? saved : []);
      }
    } catch (err) {
      console.error(
        "Failed to load projects from backend, falling back to localStorage:",
        err.message,
      );
      const saved = JSON.parse(localStorage.getItem(GUEST_PROJECTS_KEY));
      setProjects(Array.isArray(saved) ? saved : []);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) return;
    const localProject = {
      id: Date.now().toString(),
      name: projectName,
      files: [
        {
          id: Date.now(),
          name: "index.js",
          content: `// ${projectName}\n// Welcome to klyro\n\nfunction main() {\n  console.log('Hello from ${projectName}');\n}\n\nmain();`,
          isMain: true,
        },
      ],
      language: "JavaScript",
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (isSignedIn) {
      try {
        const newProject = await createProjectAPI(projectName, "", getToken);
        setProjects((prev) => [newProject, ...prev]);
        setProjectName("");
        setShowNewProjectModal(false);
        toast.success("Project created");
        return;
      } catch (err) {
        console.error("Backend create failed, saving locally:", err.message);
      }
    }

    const updated = [...projects, localProject];
    setProjects(updated);
    localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(updated));
    setProjectName("");
    setShowNewProjectModal(false);
    toast.success("Project created locally");
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    setProjects((prev) => prev.filter((p) => (p.id || p._id) !== projectId));

    if (isSignedIn) {
      try {
        await deleteProjectAPI(projectId, getToken);
        toast.success("Project deleted");
        return;
      } catch (err) {
        console.error("Backend delete failed:", err.message);
      }
    }

    const updated = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(updated));
    toast.success("Project deleted locally");
  };

  const handleOpen = (project) =>
    navigate(`/editor/${project._id || project.id}`);

  const handleEdit = async (project) => {
    setRenameTarget(project);
    setRenameValue(project.name);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async (newName) => {
    if (!renameTarget) return;
    const editedName = newName.trim();
    if (!editedName) return;

    const id = renameTarget._id || renameTarget.id;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id || p._id === id ? { ...p, name: editedName } : p,
      ),
    );

    if (isSignedIn && renameTarget._id) {
      try {
        await updateProjectAPI(
          renameTarget._id,
          { name: editedName },
          getToken,
        );
        toast.success("Project renamed");
        return;
      } catch (err) {
        console.error("Backend rename failed:", err.message);
      }
    }

    const updated = projects.map((p) =>
      p.id === id
        ? { ...p, name: editedName, lastModified: new Date().toISOString() }
        : p,
    );
    localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(updated));
    toast.success("Project renamed locally");
  };

  const handleShare = (updatedProject) => {
    if (updatedProject) {
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)),
      );
    }
  };

  const handleExport = () => {
    const data = {
      projects,
      exportedAt: new Date().toISOString(),
      source: "klyro",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klyro-projects-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const importedProjects = data.projects || data;
        if (!Array.isArray(importedProjects)) {
          toast.error("Invalid file format");
          return;
        }
        const migrated = importedProjects.map((p) => ({
          ...p,
          id: p.id || Date.now().toString(),
          files: (p.files || []).map((f) => ({
            ...f,
            id: f.id || Date.now(),
            isMain: f.isMain || false,
          })),
          lastModified: p.lastModified || new Date().toISOString(),
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        const updated = [...projects, ...migrated];
        setProjects(updated);
        localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(updated));
        toast.success(`Imported ${migrated.length} project(s)`);
      } catch {
        toast.error("Failed to parse import file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const t = {
    bg: "var(--bg-primary)",
    bg2: "var(--bg-secondary)",
    bg3: "var(--bg-tertiary)",
    text: "var(--text-primary)",
    text2: "var(--text-secondary)",
    text3: "var(--text-tertiary)",
    border: "var(--border)",
    borderStrong: "var(--border-strong)",
    accent: "var(--accent)",
  };

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: t.bg }}
    >
      <Navbar />
      <div className="flex-1 flex overflow-hidden pt-16">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="px-8 py-6"
            style={{
              borderBottom: `1px solid ${t.border}`,
              backgroundColor: t.bg3,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: t.text }}>
                  Projects
                </h1>
                <p className="text-sm mt-1" style={{ color: t.text3 }}>
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                  {!isSignedIn && (
                    <span className="ml-2 opacity-60">(local)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={projects.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: t.bg2,
                    border: `1px solid ${t.border}`,
                    color: t.text2,
                  }}
                  title="Export all projects as JSON"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  style={{
                    backgroundColor: t.bg2,
                    border: `1px solid ${t.border}`,
                    color: t.text2,
                  }}
                  title="Import projects from JSON"
                >
                  <Upload size={16} />
                  Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Plus size={20} />
                  New Project
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: t.text3 }}>
                  Loading projects...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4" style={{ color: t.text3, opacity: 0.3 }}>
                  <FileCode size={64} />
                </div>
                <h2
                  className="text-2xl font-semibold mb-2"
                  style={{ color: t.text }}
                >
                  No projects yet
                </h2>
                <p className="mb-6 max-w-md" style={{ color: t.text3 }}>
                  Get started by creating your first project or importing an
                  existing one.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <Plus size={20} />
                    Create New Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project._id || project.id}
                    project={project}
                    onOpen={handleOpen}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewProjectModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="rounded-lg p-6 w-96 shadow-2xl"
            style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}` }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: t.text }}>
              Create New Project
            </h2>
            <input
              type="text"
              placeholder="Project name (e.g., My Awesome App)"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && createProject()}
              className="w-full rounded px-4 py-2 mb-4 focus:outline-none text-sm"
              style={{
                backgroundColor: t.bg3,
                border: `1px solid ${t.border}`,
                color: t.text,
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setProjectName("");
                }}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: t.bg3, color: t.text2 }}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!projectName.trim()}
                className="flex-1 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <PromptModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setRenameTarget(null);
        }}
        onSubmit={handleRenameSubmit}
        title="Rename Project"
        placeholder="Project name"
        defaultValue={renameValue}
      />
    </div>
  );
}

export default Projects;
