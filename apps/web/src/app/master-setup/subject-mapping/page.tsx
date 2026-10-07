"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Lightbulb,
  LayoutGrid,
  List,
  Check,
  FolderTree,
  FileText,
  MoveRight,
  Sparkles,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
  code: string;
  creditHours: string;
  category: string;
  description: string;
}

interface ClassMappingNode {
  id: string;
  name: string;
  type: "Level" | "Class" | "Section";
  mappedSubjectIds: string[];
  children?: ClassMappingNode[];
}

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    name: "Compulsory English",
    code: "ENG101",
    creditHours: "4",
    category: "Theory & Practical",
    description: "Core English language and literature curriculum",
  },
  {
    id: "sub-2",
    name: "Compulsory Nepali",
    code: "NEP102",
    creditHours: "4",
    category: "Theory & Practical",
    description: "National curriculum Nepali language study",
  },
  {
    id: "sub-3",
    name: "Compulsory Mathematics",
    code: "MATH103",
    creditHours: "4",
    category: "Theory",
    description: "Foundational mathematics and algebra",
  },
  {
    id: "sub-4",
    name: "Science & Technology",
    code: "SCI104",
    creditHours: "4",
    category: "Theory & Practical",
    description: "Physics, chemistry, biology and scientific methods",
  },
  {
    id: "sub-5",
    name: "Social Studies & Life Skills",
    code: "SOC105",
    creditHours: "4",
    category: "Theory",
    description: "History, geography, civic awareness, and moral values",
  },
  {
    id: "sub-6",
    name: "Computer Science",
    code: "CS106",
    creditHours: "3",
    category: "Practical",
    description: "Information technology, algorithms, and practical programming",
  },
  {
    id: "sub-7",
    name: "Optional Mathematics",
    code: "OPM107",
    creditHours: "4",
    category: "Theory",
    description: "Advanced calculus, trigonometry, and coordinate geometry",
  },
];

const DEFAULT_HIERARCHY_MAPPINGS: ClassMappingNode[] = [
  {
    id: "lvl-sec",
    name: "Secondary Level (Grades 9 - 10)",
    type: "Level",
    mappedSubjectIds: [],
    children: [
      {
        id: "cls-10",
        name: "Grade 10",
        type: "Class",
        mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5", "sub-6"],
        children: [
          {
            id: "sec-10a",
            name: "Section A",
            type: "Section",
            mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5", "sub-6", "sub-7"],
          },
          {
            id: "sec-10b",
            name: "Section B",
            type: "Section",
            mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5", "sub-6"],
          },
        ],
      },
      {
        id: "cls-9",
        name: "Grade 9",
        type: "Class",
        mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5"],
        children: [
          {
            id: "sec-9a",
            name: "Section A",
            type: "Section",
            mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5"],
          },
          {
            id: "sec-9b",
            name: "Section B",
            type: "Section",
            mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5"],
          },
        ],
      },
    ],
  },
  {
    id: "lvl-low-sec",
    name: "Lower Secondary Level (Grades 6 - 8)",
    type: "Level",
    mappedSubjectIds: [],
    children: [
      {
        id: "cls-8",
        name: "Grade 8",
        type: "Class",
        mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5"],
        children: [
          {
            id: "sec-8a",
            name: "Section A",
            type: "Section",
            mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5"],
          },
          {
            id: "sec-8b",
            name: "Section B",
            type: "Section",
            mappedSubjectIds: ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5"],
          },
        ],
      },
    ],
  },
];

const CATEGORY_OPTIONS = [
  "Theory",
  "Practical",
  "Theory & Practical",
  "Elective / Optional",
  "Extra-Curricular",
];

export default function SubjectMappingPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [hierarchy, setHierarchy] = React.useState<ClassMappingNode[]>([]);
  const [subjectSearch, setSubjectSearch] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<"hierarchy" | "list">("hierarchy");
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({
    "lvl-sec": true,
    "cls-10": true,
    "cls-9": true,
    "lvl-low-sec": true,
    "cls-8": true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    creditHours: string;
    category: string;
    description: string;
  }>({
    name: "",
    code: "",
    creditHours: "4",
    category: "Theory & Practical",
    description: "",
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    code?: string;
    creditHours?: string;
  }>({});

  // Drag-and-drop state
  const [draggedSubjectId, setDraggedSubjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const savedSubjects = localStorage.getItem("erp_master_available_subjects_v5");
    if (savedSubjects) {
      try {
        setSubjects(JSON.parse(savedSubjects));
      } catch (e) {
        setSubjects(DEFAULT_SUBJECTS);
      }
    } else {
      setSubjects(DEFAULT_SUBJECTS);
    }

    const savedHierarchy = localStorage.getItem("erp_master_subject_mappings_hierarchy_v5");
    if (savedHierarchy) {
      try {
        setHierarchy(JSON.parse(savedHierarchy));
      } catch (e) {
        setHierarchy(DEFAULT_HIERARCHY_MAPPINGS);
      }
    } else {
      setHierarchy(DEFAULT_HIERARCHY_MAPPINGS);
    }
  }, []);

  const saveSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    localStorage.setItem("erp_master_available_subjects_v5", JSON.stringify(newSubjects));
  };

  const saveHierarchy = (newTree: ClassMappingNode[]) => {
    setHierarchy(newTree);
    localStorage.setItem("erp_master_subject_mappings_hierarchy_v5", JSON.stringify(newTree));
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Drag and Drop handlers
  const handleDragStart = (subjectId: string) => {
    setDraggedSubjectId(subjectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const mapSubjectToNode = (nodes: ClassMappingNode[], targetNodeId: string, subjectId: string): ClassMappingNode[] => {
    return nodes.map((node) => {
      if (node.id === targetNodeId) {
        if (node.mappedSubjectIds.includes(subjectId)) return node;
        return {
          ...node,
          mappedSubjectIds: [...node.mappedSubjectIds, subjectId],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: mapSubjectToNode(node.children, targetNodeId, subjectId),
        };
      }
      return node;
    });
  };

  const handleDropOnNode = (targetNodeId: string) => {
    if (!draggedSubjectId) return;
    saveHierarchy(mapSubjectToNode(hierarchy, targetNodeId, draggedSubjectId));
    setDraggedSubjectId(null);
  };

  const unmapSubjectFromNode = (nodes: ClassMappingNode[], targetNodeId: string, subjectId: string): ClassMappingNode[] => {
    return nodes.map((node) => {
      if (node.id === targetNodeId) {
        return {
          ...node,
          mappedSubjectIds: node.mappedSubjectIds.filter((id) => id !== subjectId),
        };
      }
      if (node.children) {
        return {
          ...node,
          children: unmapSubjectFromNode(node.children, targetNodeId, subjectId),
        };
      }
      return node;
    });
  };

  const handleRemoveMapping = (nodeId: string, subjectId: string) => {
    saveHierarchy(unmapSubjectFromNode(hierarchy, nodeId, subjectId));
  };

  const handleOpenAddSubject = () => {
    setFormErrors({});
    setFormData({
      name: "",
      code: "",
      creditHours: "3",
      category: "Theory & Practical",
      description: "",
    });
    setIsModalOpen(true);
  };

  const validateSubjectForm = () => {
    const errors: { name?: string; code?: string; creditHours?: string } = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = "Subject name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (formData.code.trim()) {
      const trimmedCode = formData.code.trim().toUpperCase();
      const isDuplicate = subjects.some(
        (s) => s.code.toUpperCase() === trimmedCode
      );
      if (isDuplicate) {
        errors.code = `Subject code "${trimmedCode}" already exists.`;
      }
    }

    const crHours = Number(formData.creditHours);
    if (!crHours || isNaN(crHours) || crHours <= 0) {
      errors.creditHours = "Credit hours must be > 0.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSubjectForm()) {
      return;
    }

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      creditHours: formData.creditHours.trim() || "3",
      category: formData.category,
      description: formData.description.trim(),
    };

    saveSubjects([...subjects, newSubject]);
    setIsModalOpen(false);
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  // Render Class Drop Zones Tree
  const renderTreeDropZones = (nodes: ClassMappingNode[], depth = 0): React.ReactNode => {
    return nodes.map((node) => {
      const isExpanded = expandedNodes[node.id] ?? true;
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isDroppable = node.type === "Class" || node.type === "Section";

      return (
        <div key={node.id} className="space-y-2">
          {/* Node Row / Drop Zone Container */}
          <div
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnNode(node.id)}
            className={cn(
              "p-3.5 rounded-[6px] border transition-all duration-150",
              depth === 0
                ? "bg-white border-[var(--border-default)] shadow-2xs"
                : depth === 1
                ? "bg-[var(--neutral-50)]/70 border-[var(--border-default)] ml-4 sm:ml-6"
                : "bg-white border-dashed border-[var(--border-default)] ml-8 sm:ml-12",
              draggedSubjectId && isDroppable && "hover:border-[var(--brand-primary)] hover:bg-red-50/20"
            )}
          >
            {/* Node Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(node.id)}
                    className="p-1 rounded text-[var(--neutral-500)] hover:text-black transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <div className="w-5" />
                )}

                <div
                  className={cn(
                    "h-6 w-6 rounded-[4px] flex items-center justify-center text-xs font-bold shrink-0",
                    node.type === "Level"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : node.type === "Class"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  )}
                >
                  {node.type === "Level" ? (
                    <Layers className="h-3.5 w-3.5" />
                  ) : node.type === "Class" ? (
                    <GraduationCap className="h-3.5 w-3.5" />
                  ) : (
                    <FolderTree className="h-3.5 w-3.5" />
                  )}
                </div>

                <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {node.name}
                </span>

                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[var(--neutral-100)] text-[var(--neutral-600)] border border-[var(--border-default)]">
                  {node.type}
                </span>
              </div>

              {isDroppable && (
                <span className="text-[11px] text-[var(--neutral-400)] font-medium">
                  {node.mappedSubjectIds.length} subjects mapped
                </span>
              )}
            </div>

            {/* Mapped Subjects Drop Zone / Pill Container */}
            {isDroppable && (
              <div className="mt-3 pt-2.5 border-t border-[var(--border-default)]">
                {node.mappedSubjectIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {node.mappedSubjectIds.map((subId) => {
                      const subject = getSubjectById(subId);
                      if (!subject) return null;
                      return (
                        <div
                          key={subId}
                          className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-white text-[var(--text-primary)] border border-[var(--border-default)] shadow-2xs text-xs font-medium group hover:border-[var(--brand-primary)] transition-colors"
                        >
                          <span className="font-semibold">{subject.name}</span>
                          {subject.code && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[var(--neutral-100)] text-[var(--neutral-700)] rounded">
                              {subject.code}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMapping(node.id, subId)}
                            title="Remove mapping"
                            className="p-1 rounded text-[var(--neutral-400)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnNode(node.id)}
                    className="py-2.5 px-3 border border-dashed border-[var(--neutral-300)] rounded-[4px] text-center text-xs text-[var(--neutral-400)] bg-[var(--neutral-50)]/40 hover:bg-red-50/30 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all cursor-pointer"
                  >
                    Drag subjects here or drop to map
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recursive Children */}
          {hasChildren && isExpanded && (
            <div className="space-y-2">{renderTreeDropZones(node.children!, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      <ErpHeader />
      <ErpTopNav activeModuleId="academics" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb matching screenshot: Setup > Subject Mapping */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">Subject Mapping</span>
        </div>

        {/* 2-Column Responsive Split Layout matching screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL (7 Cols): Class Hierarchy Drop Zones */}
          <div className="lg:col-span-7 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
            {/* Left Header matching screenshot */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                    Class Hierarchy
                  </h1>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Drag subjects to the drop zones below
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px]">
                <button
                  type="button"
                  onClick={() => setViewMode("hierarchy")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                    viewMode === "hierarchy"
                      ? "bg-white text-[var(--brand-primary)] shadow-2xs"
                      : "text-[var(--neutral-600)] hover:text-black"
                  )}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Hierarchy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                    viewMode === "list"
                      ? "bg-white text-[var(--brand-primary)] shadow-2xs"
                      : "text-[var(--neutral-600)] hover:text-black"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List View</span>
                </button>
              </div>
            </div>

            {/* Left Content Area */}
            <div className="p-4 sm:p-5 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {hierarchy.length > 0 ? (
                renderTreeDropZones(hierarchy)
              ) : (
                <div className="py-16 text-center space-y-3">
                  <Layers className="h-10 w-10 text-[var(--neutral-400)] mx-auto" />
                  <p className="text-xs font-medium text-[var(--neutral-500)]">
                    No class hierarchy found. Setup classes in Class Setup first.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL (5 Cols): Available Subjects matching screenshot */}
          <div className="lg:col-span-5 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col">
            {/* Right Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 text-[var(--brand-primary)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Available Subjects
                  </h2>
                  <span className="text-xs text-[var(--neutral-500)]">
                    {subjects.length} subjects
                  </span>
                </div>
              </div>

              {/* + New Subject button matching screenshot */}
              <button
                type="button"
                onClick={handleOpenAddSubject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ New Subject</span>
              </button>
            </div>

            {/* Right Search Input matching screenshot */}
            <div className="p-4 border-b border-[var(--border-default)]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Search subjects..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Right Subjects List / Empty State */}
            <div className="p-4 flex-1 space-y-2.5 max-h-[380px] overflow-y-auto">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    draggable
                    onDragStart={() => handleDragStart(subject.id)}
                    className="p-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--neutral-50)]/60 hover:bg-white hover:border-[var(--brand-primary)] hover:shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing select-none group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-xs text-[var(--text-primary)]">
                        {subject.name}
                      </div>
                      {subject.code && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-white rounded border border-[var(--border-default)] text-[var(--neutral-800)]">
                          {subject.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--neutral-500)]">
                      <span>{subject.creditHours} Credit Hrs</span>
                      <span>•</span>
                      <span className="text-[var(--neutral-600)] font-medium">{subject.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                /* Empty state matching screenshot */
                <div className="py-12 text-center space-y-2">
                  <BookOpen className="h-10 w-10 text-[var(--neutral-400)] mx-auto opacity-60" />
                  <p className="text-xs font-semibold text-[var(--neutral-500)]">
                    No subjects found
                  </p>
                </div>
              )}
            </div>

            {/* Helper Guide Box matching screenshot exactly */}
            <div className="p-4 m-4 bg-amber-50/60 border border-amber-200 rounded-[6px] space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Lightbulb className="h-4 w-4 text-amber-700 shrink-0" />
                <span>How to map:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-900/90 pl-1 leading-relaxed">
                <li>Drag a subject from this list</li>
                <li>Drop it into the drop zone under a Class or Semester</li>
                <li>The subject will be mapped to that class</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Add New Subject matching screenshot exactly */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-md bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Add New Subject
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Create a new subject
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[var(--neutral-400)] hover:text-black transition-colors rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form matching screenshot */}
            <form onSubmit={handleCreateSubject} className="p-5 space-y-4">
              {/* Subject Name * */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Subject Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g., Mathematics, Physics, English"
                  className={cn(
                    "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                    formErrors.name
                      ? "border-red-500 bg-red-50/10"
                      : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                  )}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Row with Subject Code & Credit Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({ ...formData, code: e.target.value });
                      if (formErrors.code) setFormErrors({ ...formErrors, code: undefined });
                    }}
                    placeholder="e.g., MATH101"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none uppercase font-mono transition-colors",
                      formErrors.code
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.code && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.code}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Credit Hours
                  </label>
                  <input
                    type="text"
                    value={formData.creditHours}
                    onChange={(e) => {
                      setFormData({ ...formData, creditHours: e.target.value });
                      if (formErrors.creditHours) setFormErrors({ ...formErrors, creditHours: undefined });
                    }}
                    placeholder="e.g., 3"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      formErrors.creditHours
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.creditHours && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.creditHours}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the subject..."
                  className="w-full p-2.5 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] resize-none"
                />
              </div>

              {/* Modal Footer Buttons matching screenshot */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--neutral-700)] bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] rounded-[4px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] hover:bg-red-700 text-white rounded-[4px] shadow-xs transition-colors cursor-pointer"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
