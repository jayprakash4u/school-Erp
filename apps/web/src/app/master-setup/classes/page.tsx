"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderTree,
  LayoutGrid,
  BookOpen,
  Layout,
  Check,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type ClassNodeType =
  | "Hierarchy"
  | "Level"
  | "Group"
  | "Semester"
  | "Class"
  | "Section";

export interface ClassNode {
  id: string;
  name: string;
  type: ClassNodeType;
  parentId?: string | null;
  children?: ClassNode[];
}

const TYPE_OPTIONS: {
  label: ClassNodeType;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}[] = [
  {
    label: "Hierarchy",
    description: "Multi-tier organizational grouping",
    icon: FolderTree,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
  },
  {
    label: "Level",
    description: "Academic division (e.g., Secondary, Primary)",
    icon: Layers,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    label: "Group",
    description: "Faculty / Stream grouping (e.g., Science, Management)",
    icon: LayoutGrid,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  {
    label: "Semester",
    description: "Semester / Term academic bracket",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
  },
  {
    label: "Class",
    description: "Standard classroom grade (e.g., Grade 10)",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    label: "Section",
    description: "Individual section division (e.g., Section A)",
    icon: Layout,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-200",
  },
];

const DEFAULT_HIERARCHY: ClassNode[] = [
  {
    id: "lvl-1",
    name: "Secondary Level (Grades 9 - 10)",
    type: "Level",
    children: [
      {
        id: "cls-10",
        name: "Grade 10",
        type: "Class",
        parentId: "lvl-1",
        children: [
          {
            id: "sec-10a",
            name: "Section A",
            type: "Section",
            parentId: "cls-10",
          },
          {
            id: "sec-10b",
            name: "Section B",
            type: "Section",
            parentId: "cls-10",
          },
        ],
      },
      {
        id: "cls-9",
        name: "Grade 9",
        type: "Class",
        parentId: "lvl-1",
        children: [
          {
            id: "sec-9a",
            name: "Section A",
            type: "Section",
            parentId: "cls-9",
          },
          {
            id: "sec-9b",
            name: "Section B",
            type: "Section",
            parentId: "cls-9",
          },
        ],
      },
    ],
  },
  {
    id: "lvl-2",
    name: "Lower Secondary Level (Grades 6 - 8)",
    type: "Level",
    children: [
      {
        id: "cls-8",
        name: "Grade 8",
        type: "Class",
        parentId: "lvl-2",
        children: [
          {
            id: "sec-8a",
            name: "Section A",
            type: "Section",
            parentId: "cls-8",
          },
          {
            id: "sec-8b",
            name: "Section B",
            type: "Section",
            parentId: "cls-8",
          },
          {
            id: "sec-8c",
            name: "Section C",
            type: "Section",
            parentId: "cls-8",
          },
        ],
      },
      {
        id: "cls-7",
        name: "Grade 7",
        type: "Class",
        parentId: "lvl-2",
        children: [
          {
            id: "sec-7a",
            name: "Section A",
            type: "Section",
            parentId: "cls-7",
          },
          {
            id: "sec-7b",
            name: "Section B",
            type: "Section",
            parentId: "cls-7",
          },
        ],
      },
    ],
  },
  {
    id: "lvl-3",
    name: "Primary Level (Grades 1 - 5)",
    type: "Level",
    children: [
      {
        id: "cls-1",
        name: "Grade 1",
        type: "Class",
        parentId: "lvl-3",
        children: [
          {
            id: "sec-1a",
            name: "Section A",
            type: "Section",
            parentId: "cls-1",
          },
          {
            id: "sec-1b",
            name: "Section B",
            type: "Section",
            parentId: "cls-1",
          },
        ],
      },
    ],
  },
];

export default function ClassSetupPage() {
  const [hierarchy, setHierarchy] = React.useState<ClassNode[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({
    "lvl-1": true,
    "cls-10": true,
    "cls-9": true,
    "lvl-2": true,
    "cls-8": true,
    "cls-7": true,
    "lvl-3": true,
    "cls-1": true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingNode, setEditingNode] = React.useState<ClassNode | null>(null);
  const [parentTargetNode, setParentTargetNode] = React.useState<ClassNode | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = React.useState<boolean>(false);

  // Form State strictly matching screenshot: Class Name & Type
  const [formData, setFormData] = React.useState<{
    name: string;
    type: ClassNodeType;
  }>({
    name: "",
    type: "Class",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_class_hierarchy_v3");
    if (saved) {
      try {
        setHierarchy(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setHierarchy(DEFAULT_HIERARCHY);
  }, []);

  const saveHierarchy = (newTree: ClassNode[]) => {
    setHierarchy(newTree);
    localStorage.setItem("erp_master_class_hierarchy_v3", JSON.stringify(newTree));
  };

  const [nameError, setNameError] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddRoot = () => {
    setEditingNode(null);
    setParentTargetNode(null);
    setNameError(null);
    setFormData({
      name: "",
      type: "Class",
    });
    setIsTypeDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenAddChild = (parent: ClassNode) => {
    setEditingNode(null);
    setParentTargetNode(parent);
    setNameError(null);
    const suggestedType: ClassNodeType =
      parent.type === "Level" ? "Class" : parent.type === "Class" ? "Section" : "Group";
    setFormData({
      name: "",
      type: suggestedType,
    });
    setIsTypeDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (node: ClassNode) => {
    setEditingNode(node);
    setParentTargetNode(null);
    setNameError(null);
    setFormData({
      name: node.name,
      type: node.type,
    });
    setIsTypeDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Recursive delete
  const deleteNodeRecursive = (nodes: ClassNode[], targetId: string): ClassNode[] => {
    return nodes
      .filter((n) => n.id !== targetId)
      .map((n) => ({
        ...n,
        children: n.children ? deleteNodeRecursive(n.children, targetId) : undefined,
      }));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this class node and all its children?")) return;
    saveHierarchy(deleteNodeRecursive(hierarchy, id));
  };

  // Recursive update
  const updateNodeRecursive = (nodes: ClassNode[], targetId: string, updatedData: Partial<ClassNode>): ClassNode[] => {
    return nodes.map((n) => {
      if (n.id === targetId) {
        return {
          ...n,
          ...updatedData,
        };
      }
      return {
        ...n,
        children: n.children ? updateNodeRecursive(n.children, targetId, updatedData) : undefined,
      };
    });
  };

  // Recursive add child
  const addChildRecursive = (nodes: ClassNode[], parentId: string, newNode: ClassNode): ClassNode[] => {
    return nodes.map((n) => {
      if (n.id === parentId) {
        return {
          ...n,
          children: [...(n.children || []), newNode],
        };
      }
      return {
        ...n,
        children: n.children ? addChildRecursive(n.children, parentId, newNode) : undefined,
      };
    });
  };

  const findSiblings = (nodes: ClassNode[], targetNodeId?: string, parentId?: string | null): ClassNode[] => {
    if (!parentId) {
      return nodes.filter((n) => n.id !== targetNodeId);
    }
    for (const node of nodes) {
      if (node.id === parentId) {
        return (node.children || []).filter((c) => c.id !== targetNodeId);
      }
      if (node.children) {
        const found = findSiblings(node.children, targetNodeId, parentId);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  const validateClassForm = () => {
    const trimmed = formData.name.trim();
    if (!trimmed) {
      setNameError("Node / Class name is required.");
      return false;
    }
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return false;
    }

    // Check sibling duplicates
    let siblings: ClassNode[] = [];
    if (editingNode) {
      siblings = findSiblings(hierarchy, editingNode.id, editingNode.parentId);
    } else if (parentTargetNode) {
      siblings = parentTargetNode.children || [];
    } else {
      siblings = hierarchy;
    }

    const isDuplicate = siblings.some(
      (s) =>
        s.name.toLowerCase() === trimmed.toLowerCase() &&
        s.type.toLowerCase() === formData.type.toLowerCase()
    );

    if (isDuplicate) {
      setNameError(`A ${formData.type} named "${trimmed}" already exists at this level.`);
      return false;
    }

    setNameError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClassForm()) {
      return;
    }

    if (editingNode) {
      const updated = updateNodeRecursive(hierarchy, editingNode.id, {
        name: formData.name.trim(),
        type: formData.type,
      });
      saveHierarchy(updated);
    } else if (parentTargetNode) {
      const newNode: ClassNode = {
        id: `node-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type,
        parentId: parentTargetNode.id,
        children: [],
      };
      saveHierarchy(addChildRecursive(hierarchy, parentTargetNode.id, newNode));
      setExpandedNodes((prev) => ({ ...prev, [parentTargetNode.id]: true }));
    } else {
      // Add Root Class
      const newNode: ClassNode = {
        id: `root-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type,
        children: [],
      };
      saveHierarchy([...hierarchy, newNode]);
    }

    setIsModalOpen(false);
  };

  // Flattened count helpers
  let totalClasses = 0;
  let totalSections = 0;
  let totalLevels = 0;

  const countNodes = (nodes: ClassNode[]) => {
    for (const node of nodes) {
      if (node.type === "Class") totalClasses++;
      if (node.type === "Section") totalSections++;
      if (node.type === "Level") totalLevels++;
      if (node.children) countNodes(node.children);
    }
  };
  countNodes(hierarchy);

  const selectedTypeOption =
    TYPE_OPTIONS.find((t) => t.label === formData.type) || TYPE_OPTIONS[4];

  // Render recursive node tree
  const renderTreeNodes = (nodes: ClassNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => {
      const isExpanded = expandedNodes[node.id] ?? true;
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const typeConfig = TYPE_OPTIONS.find((t) => t.label === node.type) || TYPE_OPTIONS[4];
      const NodeIcon = typeConfig.icon;

      const matchesSearch =
        !searchQuery ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        <React.Fragment key={node.id}>
          {matchesSearch && (
            <div
              className={cn(
                "group flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] transition-colors",
                level === 0 ? "bg-white font-semibold" : level === 1 ? "bg-[var(--neutral-50)]/40 pl-9" : "bg-[var(--neutral-50)]/90 pl-16",
                "hover:bg-[var(--red-50)]/30"
              )}
            >
              {/* Left: Expander + Icon + Name + Badges */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-4">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(node.id)}
                    className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-neutral-200/60 transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="w-6" />
                )}

                <div
                  className={cn(
                    "h-7 w-7 rounded-[4px] flex items-center justify-center border shrink-0",
                    typeConfig.bgColor,
                    typeConfig.color
                  )}
                >
                  <NodeIcon className="h-3.5 w-3.5" />
                </div>

                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    className={cn(
                      "text-xs tracking-tight truncate",
                      level === 0 ? "font-bold text-[var(--text-primary)]" : "font-semibold text-[var(--text-primary)]"
                    )}
                  >
                    {node.name}
                  </span>

                  {/* Type Badge */}
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border",
                      typeConfig.bgColor,
                      typeConfig.color
                    )}
                  >
                    {node.type}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Add Child button if not a terminal section */}
                {node.type !== "Section" && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddChild(node)}
                    title={`Add child under ${node.name}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[var(--brand-primary)] hover:bg-[var(--red-50)] rounded transition-colors cursor-pointer border border-[var(--red-100)]"
                  >
                    <Plus className="h-3 w-3" />
                    <span>
                      {node.type === "Level" ? "Add Class" : node.type === "Class" ? "Add Section" : "Add Child"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenEdit(node)}
                  title="Edit"
                  className="p-1.5 rounded text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(node.id)}
                  title="Delete"
                  className="p-1.5 rounded text-[var(--neutral-600)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Children */}
          {hasChildren && isExpanded && renderTreeNodes(node.children!, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      <ErpHeader />
      <ErpTopNav activeModuleId="master-setup" />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb matching screenshot: Setup > Class Setup */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">Class Setup</span>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-red-50 text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Total Classes</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{totalClasses}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layout className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Total Sections</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{totalSections}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Academic Levels</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{totalLevels}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Hierarchy Model</div>
              <div className="text-base font-bold text-[var(--text-primary)]">6-Tier Tree</div>
            </div>
          </div>
        </div>

        {/* Card Header matching reference screenshot: Class Hierarchy */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Class Hierarchy
                </h1>
                <p className="text-xs text-[var(--neutral-500)]">
                  Create and manage classes in a hierarchical structure
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {hierarchy.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search classes..."
                    className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-48 sm:w-56"
                  />
                </div>
              )}

              {/* + Add Root Class button matching screenshot */}
              <button
                type="button"
                onClick={handleOpenAddRoot}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Root Class</span>
              </button>
            </div>
          </div>

          {/* Tree View / Hierarchy List */}
          {hierarchy.length > 0 ? (
            <div className="divide-y divide-[var(--border-default)]">
              {renderTreeNodes(hierarchy)}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <GraduationCap className="h-10 w-10 text-[var(--neutral-400)] mx-auto" />
              <p className="text-xs font-medium text-[var(--neutral-500)]">
                No classes found. Click &ldquo;+ Add Root Class&rdquo; to create one.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal matching screenshot exactly */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-visible animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingNode
                    ? "Edit Class Hierarchy Node"
                    : parentTargetNode
                    ? `Add Child Under ${parentTargetNode.name}`
                    : "Add Root Class"}
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  {editingNode
                    ? "Update class details and structure"
                    : parentTargetNode
                    ? `Create a sub-tier node under ${parentTargetNode.name}`
                    : "Create a new root level class (e.g., Grade 1, Grade 2)"}
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Class Name * */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Class Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (nameError) setNameError(null);
                  }}
                  placeholder="e.g., Grade 1, Section A"
                  className={cn(
                    "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                    nameError
                      ? "border-red-500 bg-red-50/10"
                      : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                  )}
                />
                {nameError && (
                  <p className="text-[11px] text-red-600 font-medium">{nameError}</p>
                )}
              </div>

              {/* Type * Custom dropdown with icons matching screenshot */}
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Type <span className="text-red-600">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] flex items-center justify-between focus:outline-none focus:border-[var(--brand-primary)] hover:border-neutral-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <selectedTypeOption.icon className={cn("h-4 w-4", selectedTypeOption.color)} />
                    <span className="font-medium text-[var(--text-primary)]">
                      {selectedTypeOption.label}
                    </span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-neutral-400 transition-transform", isTypeDropdownOpen && "rotate-180")} />
                </button>

                {/* Dropdown Options Popup matching screenshot */}
                {isTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[var(--border-default)] rounded-[6px] shadow-xl z-50 py-1.5 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                    {TYPE_OPTIONS.map((opt) => {
                      const isSelected = formData.type === opt.label;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, type: opt.label });
                            setIsTypeDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-[var(--neutral-50)] transition-colors cursor-pointer",
                            isSelected && "bg-[var(--neutral-50)] font-semibold"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={cn("h-3.5 w-3.5 text-center text-xs", isSelected ? "text-[var(--brand-primary)] font-bold" : "opacity-0")}>
                              ✓
                            </span>
                            <Icon className={cn("h-4 w-4", opt.color)} />
                            <span className="text-[var(--text-primary)]">{opt.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
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
                  {editingNode ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
