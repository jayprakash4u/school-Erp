"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Award,
  BookOpen,
  Droplet,
  Globe,
  Heart,
  Flag,
  Languages,
  Tag,
  GraduationCap,
  Users,
  Building,
  CreditCard,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// Interface for master option item with Order
interface MasterOptionItem {
  id: string;
  name: string;
  code?: string;
  order: number;
}

// Definition of each setup tab
interface SetupTabConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultItems: MasterOptionItem[];
}

const SETUP_TABS: SetupTabConfig[] = [
  {
    id: "gender",
    title: "Gender",
    subtitle: "Manage gender options",
    icon: User,
    defaultItems: [
      { id: "1", name: "Male", code: "M", order: 1 },
      { id: "2", name: "Female", code: "F", order: 2 },
      { id: "3", name: "Other", code: "O", order: 3 },
    ],
  },
  {
    id: "salutation",
    title: "Salutation",
    subtitle: "Manage prefix titles for students, guardians, and staff",
    icon: UserCheck,
    defaultItems: [
      { id: "1", name: "Mr.", code: "MR", order: 1 },
      { id: "2", name: "Ms.", code: "MS", order: 2 },
      { id: "3", name: "Mrs.", code: "MRS", order: 3 },
      { id: "4", name: "Dr.", code: "DR", order: 4 },
      { id: "5", name: "Prof.", code: "PROF", order: 5 },
    ],
  },
  {
    id: "religion",
    title: "Religion",
    subtitle: "Manage religion categories for demographic records",
    icon: BookOpen,
    defaultItems: [
      { id: "1", name: "Hinduism", code: "HIN", order: 1 },
      { id: "2", name: "Buddhism", code: "BUD", order: 2 },
      { id: "3", name: "Islam", code: "ISL", order: 3 },
      { id: "4", name: "Christianity", code: "CHR", order: 4 },
      { id: "5", name: "Kirat", code: "KIR", order: 5 },
      { id: "6", name: "Other", code: "OTH", order: 6 },
    ],
  },
  {
    id: "blood-group",
    title: "Blood Group",
    subtitle: "Manage medical blood group classifications",
    icon: Droplet,
    defaultItems: [
      { id: "1", name: "A+", code: "A_POS", order: 1 },
      { id: "2", name: "A-", code: "A_NEG", order: 2 },
      { id: "3", name: "B+", code: "B_POS", order: 3 },
      { id: "4", name: "B-", code: "B_NEG", order: 4 },
      { id: "5", name: "AB+", code: "AB_POS", order: 5 },
      { id: "6", name: "AB-", code: "AB_NEG", order: 6 },
      { id: "7", name: "O+", code: "O_POS", order: 7 },
      { id: "8", name: "O-", code: "O_NEG", order: 8 },
    ],
  },
  {
    id: "ethnic-group",
    title: "Ethnic Group",
    subtitle: "Manage ethnicity classifications as per government guidelines",
    icon: Globe,
    defaultItems: [
      { id: "1", name: "Brahmin / Chhetri", code: "BC", order: 1 },
      { id: "2", name: "Janajati / Indigenous", code: "JAN", order: 2 },
      { id: "3", name: "Dalit", code: "DAL", order: 3 },
      { id: "4", name: "Madhesi", code: "MAD", order: 4 },
      { id: "5", name: "Muslim", code: "MUS", order: 5 },
      { id: "6", name: "Other Minorities", code: "OTH", order: 6 },
    ],
  },
  {
    id: "marital-status",
    title: "Marital Status",
    subtitle: "Manage marital status options for staff and parents",
    icon: Heart,
    defaultItems: [
      { id: "1", name: "Single", code: "S", order: 1 },
      { id: "2", name: "Married", code: "M", order: 2 },
      { id: "3", name: "Divorced", code: "D", order: 3 },
      { id: "4", name: "Widowed", code: "W", order: 4 },
    ],
  },
  {
    id: "nationality",
    title: "Nationality",
    subtitle: "Manage list of recognized nationalities",
    icon: Flag,
    defaultItems: [
      { id: "1", name: "Nepali", code: "NPL", order: 1 },
      { id: "2", name: "Indian", code: "IND", order: 2 },
      { id: "3", name: "Chinese", code: "CHN", order: 3 },
      { id: "4", name: "American", code: "USA", order: 4 },
      { id: "5", name: "Other", code: "OTH", order: 5 },
    ],
  },
  {
    id: "language",
    title: "Language",
    subtitle: "Manage primary and secondary spoken languages",
    icon: Languages,
    defaultItems: [
      { id: "1", name: "Nepali", code: "NEP", order: 1 },
      { id: "2", name: "English", code: "ENG", order: 2 },
      { id: "3", name: "Maithili", code: "MAI", order: 3 },
      { id: "4", name: "Bhojpuri", code: "BHO", order: 4 },
      { id: "5", name: "Newari (Nepal Bhasa)", code: "NEW", order: 5 },
      { id: "6", name: "Tamang", code: "TAM", order: 6 },
      { id: "7", name: "Hindi", code: "HIN", order: 7 },
    ],
  },
  {
    id: "caste",
    title: "Caste",
    subtitle: "Manage caste sub-categories",
    icon: Tag,
    defaultItems: [
      { id: "1", name: "Arya", code: "ARY", order: 1 },
      { id: "2", name: "Mongol", code: "MON", order: 2 },
      { id: "3", name: "Dravid", code: "DRA", order: 3 },
      { id: "4", name: "Not Specified", code: "NA", order: 4 },
    ],
  },
  {
    id: "parents-education",
    title: "Parents Education",
    subtitle: "Manage educational qualification levels for parents/guardians",
    icon: GraduationCap,
    defaultItems: [
      { id: "1", name: "Illiterate / No Formal Education", code: "EDU_NONE", order: 1 },
      { id: "2", name: "Primary (Grade 1-5)", code: "EDU_PRI", order: 2 },
      { id: "3", name: "Secondary / SEE (+10)", code: "EDU_SEC", order: 3 },
      { id: "4", name: "Higher Secondary (+2)", code: "EDU_HSEC", order: 4 },
      { id: "5", name: "Bachelor's Degree", code: "EDU_BACH", order: 5 },
      { id: "6", name: "Master's Degree", code: "EDU_MAST", order: 6 },
      { id: "7", name: "Doctorate / PhD", code: "EDU_PHD", order: 7 },
    ],
  },
  {
    id: "relation-to-guardian",
    title: "Relation To Guardian",
    subtitle: "Manage family and legal relationships to guardians",
    icon: Users,
    defaultItems: [
      { id: "1", name: "Father", code: "REL_FAT", order: 1 },
      { id: "2", name: "Mother", code: "REL_MOT", order: 2 },
      { id: "3", name: "Grandfather", code: "REL_GFAT", order: 3 },
      { id: "4", name: "Grandmother", code: "REL_GMOT", order: 4 },
      { id: "5", name: "Uncle", code: "REL_UNC", order: 5 },
      { id: "6", name: "Aunt", code: "REL_AUNT", order: 6 },
      { id: "7", name: "Brother", code: "REL_BRO", order: 7 },
      { id: "8", name: "Sister", code: "REL_SIS", order: 8 },
      { id: "9", name: "Legal Guardian", code: "REL_LG", order: 9 },
    ],
  },
  {
    id: "scholarship-type",
    title: "Scholarship Type",
    subtitle: "Manage academic, merit, and financial scholarship categories",
    icon: Award,
    defaultItems: [
      { id: "1", name: "Merit-Based Scholarship (100% Tuition)", code: "SCH_MERIT_100", order: 1 },
      { id: "2", name: "Merit-Based Scholarship (50% Tuition)", code: "SCH_MERIT_50", order: 2 },
      { id: "3", name: "Need-Based Financial Assistance", code: "SCH_NEED", order: 3 },
      { id: "4", name: "Sibling Concession (25%)", code: "SCH_SIB_25", order: 4 },
      { id: "5", name: "Sports & Extracurricular Excellence", code: "SCH_SPORT", order: 5 },
      { id: "6", name: "Government Quota Scholarship", code: "SCH_GOV", order: 6 },
    ],
  },
  {
    id: "quota-type",
    title: "Quota Type",
    subtitle: "Manage admission and reservation quotas",
    icon: Building,
    defaultItems: [
      { id: "1", name: "Open / General Category", code: "QUOTA_GEN", order: 1 },
      { id: "2", name: "Institutional / Staff Ward", code: "QUOTA_STAFF", order: 2 },
      { id: "3", name: "Underprivileged / Remote Area", code: "QUOTA_REM", order: 3 },
      { id: "4", name: "Differently Abled / Special Needs", code: "QUOTA_DIFF", order: 4 },
      { id: "5", name: "Martyr's Children Quota", code: "QUOTA_MARTYR", order: 5 },
    ],
  },
  {
    id: "payment-mode",
    title: "Payment Mode",
    subtitle: "Manage accepted fee collection payment channels",
    icon: CreditCard,
    defaultItems: [
      { id: "1", name: "Cash Collection", code: "PM_CASH", order: 1 },
      { id: "2", name: "Bank Deposit / Cheque", code: "PM_BANK", order: 2 },
      { id: "3", name: "eSewa Mobile Wallet", code: "PM_ESEWA", order: 3 },
      { id: "4", name: "Khalti Digital Wallet", code: "PM_KHALTI", order: 4 },
      { id: "5", name: "Fonepay / Dynamic QR", code: "PM_FONEPAY", order: 5 },
      { id: "6", name: "ConnectIPS Direct Debit", code: "PM_CONNECTIPS", order: 6 },
      { id: "7", name: "POS Card Swipe", code: "PM_POS", order: 7 },
    ],
  },
  {
    id: "installment",
    title: "Installment",
    subtitle: "Manage standard fee billing cycle installments",
    icon: Calendar,
    defaultItems: [
      { id: "1", name: "One-Time Annual Payment (100%)", code: "INST_ANNUAL", order: 1 },
      { id: "2", name: "Bi-Annual (2 Terms: 50% / 50%)", code: "INST_BIANNUAL", order: 2 },
      { id: "3", name: "Quarterly (4 Terms: 25% each)", code: "INST_QUARTERLY", order: 3 },
      { id: "4", name: "Monthly (12 Equal Payments)", code: "INST_MONTHLY", order: 4 },
    ],
  },
];

export default function GeneralSetupPage() {
  const [activeTabId, setActiveTabId] = React.useState<string>("gender");
  const [optionsData, setOptionsData] = React.useState<Record<string, MasterOptionItem[]>>({});
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<MasterOptionItem | null>(null);

  // Form State with Order field only
  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    order: number;
  }>({
    name: "",
    code: "",
    order: 1,
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    code?: string;
    order?: string;
  }>({});

  const activeTab = React.useMemo(() => {
    return SETUP_TABS.find((t) => t.id === activeTabId) || SETUP_TABS[0];
  }, [activeTabId]);

  // Load state from localStorage on mount & check URL tab query
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && SETUP_TABS.some((t) => t.id === tabParam)) {
        setActiveTabId(tabParam);
      }
    }

    const saved = localStorage.getItem("erp_master_general_options_v5");
    if (saved) {
      try {
        setOptionsData(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to parse master general options from local storage", e);
      }
    }
    // Initialize default options
    const initialMap: Record<string, MasterOptionItem[]> = {};
    for (const tab of SETUP_TABS) {
      initialMap[tab.id] = tab.defaultItems;
    }
    setOptionsData(initialMap);
  }, []);

  const saveAllOptions = (newData: Record<string, MasterOptionItem[]>) => {
    setOptionsData(newData);
    localStorage.setItem("erp_master_general_options_v5", JSON.stringify(newData));
  };

  const currentItems = optionsData[activeTabId] || activeTab.defaultItems;

  const filteredItems = React.useMemo(() => {
    let items = [...currentItems];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.code && item.code.toLowerCase().includes(q))
      );
    }
    // Sort by order ascending
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [currentItems, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormErrors({});
    const nextOrder = currentItems.length > 0 ? Math.max(...currentItems.map((i) => i.order || 0)) + 1 : 1;
    setFormData({
      name: "",
      code: "",
      order: nextOrder,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MasterOptionItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      code: item.code || "",
      order: item.order ?? 1,
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this option?")) return;
    const updated = {
      ...optionsData,
      [activeTabId]: currentItems.filter((item) => item.id !== id),
    };
    saveAllOptions(updated);
  };

  const validateForm = () => {
    const errors: { name?: string; code?: string; order?: string } = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = "Option name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Option name must be at least 2 characters.";
    } else {
      // Check duplicate name within active tab
      const isDuplicateName = currentItems.some(
        (item) =>
          item.name.toLowerCase() === trimmedName.toLowerCase() &&
          item.id !== editingItem?.id
      );
      if (isDuplicateName) {
        errors.name = `"${trimmedName}" already exists in ${activeTab.title}.`;
      }
    }

    if (formData.code.trim()) {
      const trimmedCode = formData.code.trim().toUpperCase();
      const isDuplicateCode = currentItems.some(
        (item) =>
          item.code &&
          item.code.toUpperCase() === trimmedCode &&
          item.id !== editingItem?.id
      );
      if (isDuplicateCode) {
        errors.code = `Code "${trimmedCode}" is already in use.`;
      }
    }

    if (!formData.order || isNaN(formData.order) || formData.order < 1) {
      errors.order = "Order must be a positive integer (>= 1).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const orderNum = Number(formData.order) || 1;

    if (editingItem) {
      const updatedList: MasterOptionItem[] = currentItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              order: orderNum,
            }
          : item
      );
      const updated = {
        ...optionsData,
        [activeTabId]: updatedList,
      };
      saveAllOptions(updated);
    } else {
      const newItem: MasterOptionItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        order: orderNum,
      };

      const updatedList: MasterOptionItem[] = [...currentItems, newItem];

      const updated = {
        ...optionsData,
        [activeTabId]: updatedList,
      };
      saveAllOptions(updated);
    }

    setIsModalOpen(false);
  };

  const TabActiveIcon = activeTab.icon;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      {/* 1. Global ERP Top Header */}
      <ErpHeader />

      {/* 2. Global ERP 2-Row Top Navigation Menu */}
      <ErpTopNav activeModuleId="master-setup" />

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">General Setup</span>
        </div>

        {/* 4. Horizontal Tabs Navigation Grid Bar */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-[6px] border border-[var(--border-default)] shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {SETUP_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isTabSelected = activeTabId === tab.id;
              const count = (optionsData[tab.id] || tab.defaultItems).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all duration-150 cursor-pointer border select-none",
                    isTabSelected
                      ? "bg-[var(--red-50)] text-[var(--brand-primary)] font-semibold border-[var(--brand-primary)] shadow-2xs"
                      : "bg-white text-[var(--neutral-600)] border-[var(--border-default)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] hover:border-[var(--neutral-300)]"
                  )}
                >
                  <TabIcon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isTabSelected ? "text-[var(--brand-primary)]" : "text-[var(--neutral-500)]"
                    )}
                  />
                  <span>{tab.title}</span>
                  <span
                    className={cn(
                      "ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isTabSelected
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-[var(--neutral-100)] text-[var(--neutral-500)]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Active Tab Card & Management View */}
        <div className="bg-[var(--bg-primary)] rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          {/* Card Top Title & Action Bar */}
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Active Tab Details */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                <TabActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  {activeTab.title}
                </h1>
                <p className="text-xs text-[var(--text-muted)] font-normal">{activeTab.subtitle}</p>
              </div>
            </div>

            {/* Right: Search Filter + Add New Action Button */}
            <div className="flex items-center gap-2.5">
              {currentItems.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab.title.toLowerCase()}...`}
                    className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-48 sm:w-56 transition-colors"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          {/* Table / Empty State View */}
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Option Title</th>
                    <th className="py-2.5 px-4">Code / Slug</th>
                    <th className="py-2.5 px-4 text-center w-24">Order</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--neutral-50)]/60 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)] font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {item.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--neutral-600)]">
                        {item.code || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[var(--neutral-700)] border border-[var(--border-default)]">
                          {item.order}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit"
                            className="p-1.5 rounded-[4px] text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete"
                            className="p-1.5 rounded-[4px] text-[var(--neutral-600)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State Container */
            <div className="py-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-[6px] bg-[var(--neutral-100)] text-[var(--neutral-400)] flex items-center justify-center mx-auto">
                <TabActiveIcon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                No {activeTab.title} options found
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {searchQuery
                  ? `No results matched "${searchQuery}". Clear your search query or add a new record.`
                  : `You have not created any entries for ${activeTab.title} yet. Click "Add New" to create one.`}
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add {activeTab.title}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 6. Add/Edit Option Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-md bg-[var(--bg-primary)] rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-[4px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                  <TabActiveIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItem ? `Edit ${activeTab.title}` : `Add New ${activeTab.title}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[var(--neutral-400)] hover:text-black transition-colors rounded-[4px] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Option Name / Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder={`e.g., Male, Female, A+, Nepal, etc.`}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Short Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({ ...formData, code: e.target.value });
                      if (formErrors.code) setFormErrors({ ...formErrors, code: undefined });
                    }}
                    placeholder="e.g., M, F, HIN, O_POS"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono uppercase transition-colors",
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
                    Order <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => {
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 });
                      if (formErrors.order) setFormErrors({ ...formErrors, order: undefined });
                    }}
                    placeholder="1"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      formErrors.order
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.order && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.order}</p>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
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
                  {editingItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
