"use client";

import * as React from "react";
import {
  X,
  RotateCcw,
  Plus,
  GripVertical,
  EyeOff,
  Eye,
  Trash2,
  Lock,
  Search,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  StudentFormSchema,
  FormFieldDef,
  SectionKey,
  FieldType,
} from "@/types/form-schema";
import { cn } from "@/lib/utils";

interface FieldCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: StudentFormSchema;
  onSave: (newSchema: StudentFormSchema) => void;
  onResetToDefault: () => void;
}

export function FieldCustomizerModal({
  isOpen,
  onClose,
  schema,
  onSave,
  onResetToDefault,
}: FieldCustomizerModalProps) {
  const [activeFields, setActiveFields] = React.useState<FormFieldDef[]>([]);
  const [unusedFields, setUnusedFields] = React.useState<FormFieldDef[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedSectionFilter, setSelectedSectionFilter] = React.useState<string>("all");

  // Custom Field Creation Modal State
  const [isAddingCustom, setIsAddingCustom] = React.useState<boolean>(false);
  const [customFieldLabel, setCustomFieldLabel] = React.useState<string>("");
  const [customFieldType, setCustomFieldType] = React.useState<FieldType>("text");
  const [customFieldSection, setCustomFieldSection] = React.useState<SectionKey>("personal");
  const [customFieldRequired, setCustomFieldRequired] = React.useState<boolean>(false);
  const [customFieldOptions, setCustomFieldOptions] = React.useState<string>("");
  const [customFieldPlaceholder, setCustomFieldPlaceholder] = React.useState<string>("");
  const [customFieldError, setCustomFieldError] = React.useState<string>("");

  // Drag & Drop State
  const [draggedFieldId, setDraggedFieldId] = React.useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = React.useState<string | null>(null);

  // Sync state whenever modal opens or schema changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveFields(JSON.parse(JSON.stringify(schema.activeFields)));
      setUnusedFields(JSON.parse(JSON.stringify(schema.unusedFields)));
      setSearchQuery("");
      setIsAddingCustom(false);
    }
  }, [isOpen, schema]);

  if (!isOpen) return null;

  // Toggle Required vs Optional
  const handleToggleRequired = (fieldId: string) => {
    setActiveFields((prev) =>
      prev.map((field) => {
        if (field.id === fieldId) {
          if (field.systemLocked) return field;
          return { ...field, required: !field.required };
        }
        return field;
      })
    );
  };

  // Move Active Field to Unused (Hide)
  const handleMoveToUnused = (fieldId: string) => {
    const targetField = activeFields.find((f) => f.id === fieldId);
    if (!targetField) return;
    if (targetField.systemLocked) {
      alert(`"${targetField.label}" is a core required system field and cannot be disabled.`);
      return;
    }
    setActiveFields((prev) => prev.filter((f) => f.id !== fieldId));
    setUnusedFields((prev) => [...prev, { ...targetField, order: prev.length + 1 }]);
  };

  // Move Unused Field to Active Section
  const handleActivateField = (fieldId: string, targetSection?: SectionKey) => {
    const targetField = unusedFields.find((f) => f.id === fieldId);
    if (!targetField) return;
    const destSection = targetSection || targetField.section || "personal";
    const updatedField: FormFieldDef = {
      ...targetField,
      section: destSection,
      order: activeFields.filter((f) => f.section === destSection).length + 1,
    };
    setUnusedFields((prev) => prev.filter((f) => f.id !== fieldId));
    setActiveFields((prev) => [...prev, updatedField]);
  };

  // Delete Custom Field
  const handleDeleteField = (fieldId: string) => {
    if (confirm("Are you sure you want to permanently delete this custom field?")) {
      setActiveFields((prev) => prev.filter((f) => f.id !== fieldId));
      setUnusedFields((prev) => prev.filter((f) => f.id !== fieldId));
    }
  };

  // Create Custom Field
  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFieldLabel.trim()) {
      setCustomFieldError("Field label is required.");
      return;
    }

    const fieldKey =
      "custom_" +
      customFieldLabel
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "_") +
      "_" +
      Date.now().toString().slice(-4);

    let parsedOptions: { label: string; value: string }[] | undefined = undefined;
    if (customFieldType === "select") {
      const splitOptions = customFieldOptions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (splitOptions.length === 0) {
        setCustomFieldError("Please enter at least one dropdown option (comma-separated).");
        return;
      }
      parsedOptions = splitOptions.map((opt) => ({ label: opt, value: opt }));
    }

    const newField: FormFieldDef = {
      id: "cf_" + Date.now(),
      key: fieldKey,
      label: customFieldLabel.trim(),
      type: customFieldType,
      required: customFieldRequired,
      section: customFieldSection,
      isCustom: true,
      placeholder: customFieldPlaceholder.trim() || undefined,
      options: parsedOptions,
      order: activeFields.filter((f) => f.section === customFieldSection).length + 1,
    };

    setActiveFields((prev) => [...prev, newField]);

    // Reset Form
    setCustomFieldLabel("");
    setCustomFieldType("text");
    setCustomFieldSection("personal");
    setCustomFieldRequired(false);
    setCustomFieldOptions("");
    setCustomFieldPlaceholder("");
    setCustomFieldError("");
    setIsAddingCustom(false);
  };

  // Save changes
  const handleSave = () => {
    const updatedSchema: StudentFormSchema = {
      ...schema,
      activeFields,
      unusedFields,
    };
    onSave(updatedSchema);
    onClose();
  };

  // Reset
  const handleReset = () => {
    if (confirm("Reset form layout and fields to the standard school defaults?")) {
      onResetToDefault();
      onClose();
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData("text/plain", fieldId);
    setDraggedFieldId(fieldId);
  };

  const handleDragOver = (e: React.DragEvent, sectionKey: string) => {
    e.preventDefault();
    setDragOverSection(sectionKey);
  };

  const handleDrop = (e: React.DragEvent, targetSection: SectionKey | "unused") => {
    e.preventDefault();
    setDragOverSection(null);
    const fieldId = e.dataTransfer.getData("text/plain") || draggedFieldId;
    if (!fieldId) return;

    if (targetSection === "unused") {
      handleMoveToUnused(fieldId);
    } else {
      // If dropping into an active section
      const activeField = activeFields.find((f) => f.id === fieldId);
      if (activeField) {
        // Move section within active
        setActiveFields((prev) =>
          prev.map((f) => (f.id === fieldId ? { ...f, section: targetSection } : f))
        );
      } else {
        // Moving from unused to active
        handleActivateField(fieldId, targetSection);
      }
    }
    setDraggedFieldId(null);
  };

  // Filtering for Search
  const filteredActive = activeFields.filter((field) => {
    const matchesSearch =
      !searchQuery.trim() ||
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection =
      selectedSectionFilter === "all" || field.section === selectedSectionFilter;
    return matchesSearch && matchesSection;
  });

  const filteredUnused = unusedFields.filter((field) => {
    return (
      !searchQuery.trim() ||
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group active fields by section
  const sectionsToDisplay: { key: SectionKey; title: string }[] = [
    { key: "personal", title: "PERSONAL INFORMATION" },
    { key: "address", title: "ADDRESS INFORMATION" },
    { key: "contact", title: "CONTACT INFORMATION" },
    { key: "guardian", title: "GUARDIAN INFORMATION" },
    { key: "administrative", title: "ADMINISTRATIVE INFORMATION" },
    { key: "academic", title: "ACADEMIC INFORMATION" },
    { key: "medical", title: "ADDITIONAL & MEDICAL DETAILS" },
    { key: "custom_fields", title: "CUSTOM & INSTITUTION FIELDS (STEP 6)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="w-full max-w-[1400px] h-[92vh] max-h-[900px] bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* =================================================================== */}
        {/* MODAL HEADER                                                        */}
        {/* =================================================================== */}
        <div className="px-5 py-3.5 border-b border-[var(--border-default)] bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[6px] bg-[var(--red-50)] border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Edit Student Registration Fields
              </h2>
              <p className="text-[11px] text-[var(--neutral-500)]">
                Customize visibility, required rules, or add custom fields to the admission form
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Filter */}
            <div className="relative hidden sm:block w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fields..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--neutral-50)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--neutral-400)] hover:text-[var(--neutral-800)] hover:bg-[var(--neutral-100)] rounded-[4px] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* MODAL MAIN CONTENT: SECTIONS GRID + UNUSED REPOSITORY               */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[var(--neutral-50)]/40 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-default)]">
          {/* Left / Center Workspace: Active Sections Columns */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sectionsToDisplay.map((sec) => {
                const fieldsInSec = filteredActive.filter((f) => f.section === sec.key);
                const isOver = dragOverSection === sec.key;

                return (
                  <div
                    key={sec.key}
                    onDragOver={(e) => handleDragOver(e, sec.key)}
                    onDrop={(e) => handleDrop(e, sec.key)}
                    className={cn(
                      "bg-white rounded-[6px] border transition-all duration-150 flex flex-col",
                      isOver
                        ? "border-[var(--brand-primary)] bg-[var(--red-50)]/10 ring-2 ring-[var(--brand-primary)]/20"
                        : "border-[var(--border-default)] shadow-xs"
                    )}
                  >
                    {/* Section Header */}
                    <div className="px-3.5 py-2.5 border-b border-[var(--border-default)] flex items-center justify-between bg-white rounded-t-[6px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-[var(--neutral-700)] uppercase">
                          {sec.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--neutral-100)] text-[var(--neutral-600)]">
                          {fieldsInSec.length}
                        </span>
                      </div>
                    </div>

                    {/* Section Field List */}
                    <div className="p-2.5 space-y-2 min-h-[90px] flex-1">
                      {fieldsInSec.length === 0 ? (
                        <div className="h-20 border-2 border-dashed border-[var(--border-default)] rounded-[4px] flex items-center justify-center text-[11px] text-[var(--neutral-400)]">
                          Drop or activate fields here
                        </div>
                      ) : (
                        fieldsInSec.map((field) => (
                          <div
                            key={field.id}
                            draggable={!field.systemLocked}
                            onDragStart={(e) => handleDragStart(e, field.id)}
                            className={cn(
                              "group flex items-center justify-between gap-2 p-2 rounded-[4px] border text-xs bg-white transition-all shadow-2xs select-none",
                              field.systemLocked
                                ? "border-[var(--border-default)] bg-neutral-50/50"
                                : "border-[var(--border-default)] hover:border-[var(--neutral-300)] cursor-grab active:cursor-grabbing"
                            )}
                          >
                            {/* Left Info: Drag Icon + Name */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <GripVertical className="h-3.5 w-3.5 text-[var(--neutral-400)] group-hover:text-[var(--neutral-600)] shrink-0" />
                              <span className="font-medium text-[var(--text-primary)] truncate">
                                {field.label}
                              </span>
                              {field.isCustom && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                  Custom
                                </span>
                              )}
                            </div>

                            {/* Center Badges: Requirement Toggle & Type */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Required / Optional Toggle Button */}
                              <button
                                type="button"
                                disabled={field.systemLocked}
                                onClick={() => handleToggleRequired(field.id)}
                                title={
                                  field.systemLocked
                                    ? "Locked by system"
                                    : "Click to toggle Required/Optional"
                                }
                                className={cn(
                                  "px-2 py-0.5 rounded-[3px] text-[10px] font-semibold border transition-all cursor-pointer",
                                  field.required
                                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
                                  field.systemLocked && "opacity-80 cursor-default"
                                )}
                              >
                                {field.required ? "Required" : "Optional"}
                              </button>

                              {/* Type Badge */}
                              <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono text-[var(--neutral-500)] bg-[var(--neutral-100)] border border-[var(--border-default)]">
                                {field.type}
                              </span>

                              {/* Actions: Hide / Delete */}
                              {!field.systemLocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleMoveToUnused(field.id)}
                                  title="Hide field (Move to Unused)"
                                  className="p-1 rounded text-[var(--neutral-400)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <EyeOff className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <span
                                  title="Core system locked field"
                                  className="p-1 text-neutral-300"
                                >
                                  <Lock className="h-3 w-3" />
                                </span>
                              )}

                              {field.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteField(field.id)}
                                  title="Delete custom field"
                                  className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Unused Fields Repository & + Custom Field */}
          <div
            onDragOver={(e) => handleDragOver(e, "unused")}
            onDrop={(e) => handleDrop(e, "unused")}
            className={cn(
              "w-full lg:w-80 xl:w-96 flex flex-col bg-white shrink-0 overflow-hidden transition-all",
              dragOverSection === "unused" && "bg-rose-50/20 ring-2 ring-rose-400/30"
            )}
          >
            {/* Unused Header */}
            <div className="p-3.5 border-b border-[var(--border-default)] flex items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Unused Fields
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--neutral-100)] text-[var(--neutral-600)]">
                  {filteredUnused.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="px-2.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Custom Field</span>
              </button>
            </div>

            {/* Unused Field List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {filteredUnused.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-[var(--border-default)] rounded-[6px] flex flex-col items-center justify-center p-4 text-center text-[var(--neutral-400)] space-y-1">
                  <Eye className="h-5 w-5 text-[var(--neutral-300)]" />
                  <p className="text-xs font-medium text-[var(--neutral-600)]">No Unused Fields</p>
                  <p className="text-[11px] text-[var(--neutral-400)]">
                    Drag active fields here or click &quot;+ Custom Field&quot; to create new ones
                  </p>
                </div>
              ) : (
                filteredUnused.map((field) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field.id)}
                    className="group p-2.5 rounded-[4px] border border-[var(--border-default)] hover:border-[var(--brand-primary)]/50 bg-[var(--neutral-50)]/40 hover:bg-white text-xs transition-all shadow-2xs flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <GripVertical className="h-3.5 w-3.5 text-[var(--neutral-400)] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {field.label}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--neutral-400)]">
                          <span>{field.section}</span>
                          <span>•</span>
                          <span className="font-mono">{field.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleActivateField(field.id)}
                        title="Add to active form"
                        className="px-2 py-1 rounded-[3px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>

                      {field.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          title="Delete custom field"
                          className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* MODAL FOOTER BAR                                                    */}
        {/* =================================================================== */}
        <div className="px-5 py-3.5 border-t border-[var(--border-default)] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-[4px] border border-orange-300 bg-orange-50/50 hover:bg-orange-50 text-xs font-semibold text-orange-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[4px] border border-[var(--border-default)] text-xs font-semibold text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Save Layout</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SUB-MODAL: ADD CUSTOM FIELD                                         */}
      {/* =================================================================== */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-md bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-4 py-3 bg-[var(--brand-secondary)] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--brand-accent)]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Create Custom Form Field
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomField} className="p-4 sm:p-5 space-y-4">
              {customFieldError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {customFieldError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customFieldLabel}
                  onChange={(e) => setCustomFieldLabel(e.target.value)}
                  placeholder="e.g. Previous School Roll Number"
                  className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Field Type</label>
                  <select
                    value={customFieldType}
                    onChange={(e) => setCustomFieldType(e.target.value as FieldType)}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="text">Text (Single Line)</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown (Select)</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone / Mobile</option>
                    <option value="checkbox">Checkbox (Yes / No)</option>
                    <option value="textarea">Paragraph (Textarea)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Target Section
                  </label>
                  <select
                    value={customFieldSection}
                    onChange={(e) => setCustomFieldSection(e.target.value as SectionKey)}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="custom_fields">Custom Fields Section (Step 6)</option>
                    <option value="personal">Personal Information</option>
                    <option value="academic">Academic Information</option>
                    <option value="address">Address Information</option>
                    <option value="contact">Contact Information</option>
                    <option value="guardian">Guardian Information</option>
                    <option value="medical">Medical & Additional</option>
                    <option value="administrative">Administrative Information</option>
                  </select>
                </div>
              </div>

              {customFieldType === "select" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Dropdown Options (Comma-separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customFieldOptions}
                    onChange={(e) => setCustomFieldOptions(e.target.value)}
                    placeholder="e.g. Day Scholar, Boarder, Semi-Boarder"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Placeholder / Hint
                </label>
                <input
                  type="text"
                  value={customFieldPlaceholder}
                  onChange={(e) => setCustomFieldPlaceholder(e.target.value)}
                  placeholder="Optional hint text for student"
                  className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="customFieldReqCheck"
                  checked={customFieldRequired}
                  onChange={(e) => setCustomFieldRequired(e.target.checked)}
                  className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <label
                  htmlFor="customFieldReqCheck"
                  className="text-xs font-medium text-[var(--text-primary)] cursor-pointer"
                >
                  Make this field mandatory (Required)
                </label>
              </div>

              <div className="pt-3 border-t border-[var(--border-default)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] text-xs font-semibold text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-bold shadow-xs"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
