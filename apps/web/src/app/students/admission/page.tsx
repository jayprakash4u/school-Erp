"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings2,
  User,
  GraduationCap,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Save,
  ChevronRight,
  ChevronLeft,
  X,
  UploadCloud,
  Check,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// Step Definitions
const STEPS = [
  { id: 1, label: "Personal & Admin", icon: User },
  { id: 2, label: "Academic", icon: GraduationCap },
  { id: 3, label: "Address & Guardian", icon: MapPin },
  { id: 4, label: "Additional Info", icon: FileText },
  { id: 5, label: "Documents", icon: Upload },
];

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isCustomizeOpen, setIsCustomizeOpen] = React.useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState<boolean>(false);
  const [isDraftSaved, setIsDraftSaved] = React.useState<boolean>(false);

  // Form State
  const [formData, setFormData] = React.useState({
    // Administrative Information
    applicationFormNo: "AF-2083-" + Math.floor(100 + Math.random() * 900),
    sgiNo: "SGI-" + Math.floor(1000 + Math.random() * 9000),
    scholarship: "",
    quotaType: "General Quota",
    universityRegNo: "",
    registrationDateBS: "2083-01-15",
    registrationDateAD: new Date().toISOString().split("T")[0],

    // Student Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    fullNameNepali: "",
    gender: "Male",
    dobBS: "2069-04-10",
    dobAD: "2012-07-25",
    ethnicGroup: "Brahmin / Chhetri",
    caste: "Brahmin",
    maritalStatus: "Single",
    language: "Nepali",
    nationality: "Nepali",
    religion: "Hinduism",

    // Contact Information
    mobile: "+977-98",
    email: "",
    bloodGroup: "O+",
    citizenshipNo: "",
    passportNo: "",
    nationalIdNo: "",

    // Academic Details (Step 2)
    class: "Grade 10",
    section: "Section A",
    rollNumber: "105",
    batch: "2083/84",
    previousSchoolName: "Saraswati Secondary School",
    previousGradeGpa: "3.65 GPA",
    transferCertificateNo: "TC-2082-991",
    isPreviousStudent: false,

    // Address & Guardian Details (Step 3)
    country: "Nepal",
    province: "Bagmati Province",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan",
    wardNo: "04",
    tole: "Baluwatar",
    address: "Baluwatar-4, Kathmandu",
    sameAsPermanent: true,
    tempProvince: "Bagmati Province",
    tempDistrict: "Kathmandu",
    tempMunicipality: "Kathmandu Metropolitan",
    tempWardNo: "04",
    tempAddress: "Baluwatar-4, Kathmandu",

    guardianName: "",
    relation: "Father",
    guardianMobile: "+977-98",
    guardianEmail: "",
    guardianOccupation: "Business / Professional",
    parentsEducation: "Bachelor's Degree",
    annualIncome: "NPR 1,200,000",

    // Additional & Medical Details (Step 4)
    bloodPressure: "115/75",
    heightInch: 62,
    weightKg: 48,
    medicalConditions: "None",
    healthNotes: "Normal health status",
    nutrition: "Good",
    hospitalName: "Grande Hospital",
    doctorName: "Dr. K.P. Joshi",
    wearsLens: false,
    isHostel: false,
    isBus: true,
    isDisabled: false,
    isRemote: false,

    // Documents (Step 5)
    studentPhotoUploaded: false,
    birthCertUploaded: false,
    tcUploaded: false,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required.";
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = "First name must be at least 2 characters.";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required.";
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters.";
      }

      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (stepNumber === 2) {
      if (!formData.class.trim()) {
        newErrors.class = "Class / Grade is required.";
      }
      if (!formData.section.trim()) {
        newErrors.section = "Section is required.";
      }
      if (!formData.rollNumber.trim()) {
        newErrors.rollNumber = "Roll number is required.";
      }
      if (!formData.batch.trim()) {
        newErrors.batch = "Batch session is required.";
      }
    }

    if (stepNumber === 3) {
      if (!formData.guardianName.trim()) {
        newErrors.guardianName = "Guardian name is required.";
      } else if (formData.guardianName.trim().length < 2) {
        newErrors.guardianName = "Guardian name must be at least 2 characters.";
      }

      if (!formData.relation.trim()) {
        newErrors.relation = "Relationship to student is required.";
      }

      if (!formData.guardianMobile.trim() || formData.guardianMobile.trim() === "+977-98") {
        newErrors.guardianMobile = "Guardian mobile number is required.";
      }

      if (formData.guardianEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail.trim())) {
        newErrors.guardianEmail = "Please enter a valid guardian email.";
      }

      if (!formData.district.trim()) {
        newErrors.district = "District is required.";
      }
      if (!formData.municipality.trim()) {
        newErrors.municipality = "Municipality is required.";
      }
      if (!formData.address.trim()) {
        newErrors.address = "Street address is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Submit Registration
      setIsSuccessModalOpen(true);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) {
        return;
      }
    }
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progressPercent = Math.round((currentStep / 5) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none pb-20">
      {/* 1. Global Top Header */}
      <ErpHeader />

      {/* 2. Global 2-Row Navigation Bar */}
      <ErpTopNav activeModuleId="students" />

      {/* 3. Main Form Workspace Canvas */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Top Header Bar matching screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.STUDENTS.ROOT}
              className="p-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Student Registration
              </h1>
              <p className="text-xs text-[var(--neutral-500)]">
                Register a new student in the system
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="h-8 px-3 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--neutral-700)] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Settings2 className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
            <span>Customize Fields</span>
          </button>
        </div>

        {/* 4. Multi-Step Tab Navigation Bar matching reference */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-3 space-y-3">
          <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    "flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-medium transition-all duration-150 cursor-pointer border select-none",
                    isActive
                      ? "bg-[var(--red-50)] text-[var(--brand-primary)] font-bold border-[var(--brand-primary)] shadow-2xs"
                      : isPast
                      ? "bg-white text-[var(--neutral-700)] border-[var(--border-default)] hover:bg-[var(--neutral-50)]"
                      : "bg-[var(--neutral-50)]/50 text-[var(--neutral-400)] border-transparent"
                  )}
                >
                  <StepIcon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "text-[var(--brand-primary)]" : isPast ? "text-emerald-600" : "text-[var(--neutral-400)]"
                    )}
                  />
                  <span className="truncate">{step.label}</span>
                  {isPast && <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-0.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Progress Indicator Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--neutral-500)]">
              <span>Step {currentStep} of 5</span>
              <span className="text-[var(--brand-primary)]">{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--neutral-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--brand-primary)] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL & ADMINISTRATIVE INFORMATION                             */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Section 1: Administrative Information */}
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Administrative Information
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Official use only - Registration and administrative details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Application Form No.
                  </label>
                  <input
                    type="text"
                    name="applicationFormNo"
                    value={formData.applicationFormNo}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    SGI No.
                  </label>
                  <input
                    type="text"
                    name="sgiNo"
                    value={formData.sgiNo}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Scholarship
                  </label>
                  <select
                    name="scholarship"
                    value={formData.scholarship}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="">Select Scholarship</option>
                    <option value="Merit 100%">Academic Merit 100%</option>
                    <option value="Merit 50%">Academic Merit 50%</option>
                    <option value="Need Based">Need-Based Financial Aid</option>
                    <option value="Sibling 25%">Sibling Concession 25%</option>
                    <option value="Staff Ward">Staff Ward Concession</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Quota Type
                  </label>
                  <select
                    name="quotaType"
                    value={formData.quotaType}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="General Quota">General Quota</option>
                    <option value="Government Quota">Government Quota</option>
                    <option value="Management Quota">Management Quota</option>
                    <option value="Differently Abled Quota">Differently Abled Quota</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    University Registration No.
                  </label>
                  <input
                    type="text"
                    name="universityRegNo"
                    value={formData.universityRegNo}
                    onChange={handleChange}
                    placeholder="e.g. NEB-2083-9941"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Registration Date (BS)
                  </label>
                  <input
                    type="text"
                    name="registrationDateBS"
                    value={formData.registrationDateBS}
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD (BS)"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Registration Date (AD)
                  </label>
                  <input
                    type="date"
                    name="registrationDateAD"
                    value={formData.registrationDateAD}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Student Personal Information */}
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Student Personal Information
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Highly preferred for report purpose
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.firstName
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="e.g. Kumar"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Sharma"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.lastName
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Full Name Nepali
                  </label>
                  <input
                    type="text"
                    name="fullNameNepali"
                    value={formData.fullNameNepali}
                    onChange={handleChange}
                    placeholder="Type in English, e.g. Rupesh Sharma"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Date of Birth (BS)
                  </label>
                  <input
                    type="text"
                    name="dobBS"
                    value={formData.dobBS}
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD (BS)"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Date of Birth (AD)
                  </label>
                  <input
                    type="date"
                    name="dobAD"
                    value={formData.dobAD}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Ethnic Group
                  </label>
                  <select
                    name="ethnicGroup"
                    value={formData.ethnicGroup}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Brahmin / Chhetri">Brahmin / Chhetri</option>
                    <option value="Janajati">Janajati</option>
                    <option value="Dalit">Dalit</option>
                    <option value="Madhesi">Madhesi</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Caste
                  </label>
                  <select
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Brahmin">Brahmin</option>
                    <option value="Chhetri">Chhetri</option>
                    <option value="Newar">Newar</option>
                    <option value="Gurung">Gurung</option>
                    <option value="Magar">Magar</option>
                    <option value="Rai / Limbu">Rai / Limbu</option>
                    <option value="Tamang">Tamang</option>
                    <option value="Yadav">Yadav</option>
                    <option value="Tharu">Tharu</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Marital Status
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Nepali">Nepali</option>
                    <option value="English">English</option>
                    <option value="Maithili">Maithili</option>
                    <option value="Bhojpuri">Bhojpuri</option>
                    <option value="Newari">Newari</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Nationality
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Nepali">Nepali</option>
                    <option value="Indian">Indian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Religion
                  </label>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Hinduism">Hinduism</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Kirat">Kirat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Contact Information */}
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Contact Information
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Mandatory selection for email and mobile number for communication purpose
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.email
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-bold text-red-600"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Citizenship No.
                  </label>
                  <input
                    type="text"
                    name="citizenshipNo"
                    value={formData.citizenshipNo}
                    onChange={handleChange}
                    placeholder="e.g. 27-01-79-10928"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Passport No.
                  </label>
                  <input
                    type="text"
                    name="passportNo"
                    value={formData.passportNo}
                    onChange={handleChange}
                    placeholder="e.g. N1293847"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    National ID No.
                  </label>
                  <input
                    type="text"
                    name="nationalIdNo"
                    value={formData.nationalIdNo}
                    onChange={handleChange}
                    placeholder="e.g. 902-8374-110"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ACADEMIC DETAILS                                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Enrollment & Class Details
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Academic level, section allocation, and session batch
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Class / Grade <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-8 px-2 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.class
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 5">Grade 5</option>
                  </select>
                  {errors.class && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.class}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Section <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-8 px-2 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.section
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  >
                    <option value="Section A">Section A (Sunflower)</option>
                    <option value="Section B">Section B (Lotus)</option>
                    <option value="Section C">Section C (Rose)</option>
                  </select>
                  {errors.section && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.section}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Roll Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono font-bold transition-colors",
                      errors.rollNumber
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.rollNumber && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.rollNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Academic Session / Batch <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.batch
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.batch && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.batch}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Previous School Name
                  </label>
                  <input
                    type="text"
                    name="previousSchoolName"
                    value={formData.previousSchoolName}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Previous GPA / Marks
                  </label>
                  <input
                    type="text"
                    name="previousGradeGpa"
                    value={formData.previousGradeGpa}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ADDRESS & GUARDIAN DETAILS                                        */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Permanent Address */}
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Permanent Address
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Official municipal residency details
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Province</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Koshi Province">Koshi Province</option>
                    <option value="Madhesh Province">Madhesh Province</option>
                    <option value="Bagmati Province">Bagmati Province</option>
                    <option value="Gandaki Province">Gandaki Province</option>
                    <option value="Lumbini Province">Lumbini Province</option>
                    <option value="Karnali Province">Karnali Province</option>
                    <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    District <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.district
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.district && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.district}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Municipality / Local Body <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu Metropolitan"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.municipality
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.municipality && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.municipality}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Ward No.</label>
                  <input
                    type="text"
                    name="wardNo"
                    value={formData.wardNo}
                    onChange={handleChange}
                    placeholder="e.g. 04"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Tole / Street</label>
                  <input
                    type="text"
                    name="tole"
                    value={formData.tole}
                    onChange={handleChange}
                    placeholder="e.g. Baluwatar"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Full Street Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Baluwatar-4, Kathmandu"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.address
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parent & Guardian Information */}
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Guardian & Parent Details
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Primary emergency contact and parental background
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Guardian Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="e.g. Bishnu Sharma"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.guardianName
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.guardianName && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.guardianName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Relationship <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="relation"
                    value={formData.relation}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-8 px-2 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.relation
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                  </select>
                  {errors.relation && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.relation}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Guardian Mobile <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guardianMobile"
                    value={formData.guardianMobile}
                    onChange={handleChange}
                    placeholder="+977-98XXXXXXXX"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      errors.guardianMobile
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.guardianMobile && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.guardianMobile}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Guardian Email
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    placeholder="guardian@example.com"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      errors.guardianEmail
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {errors.guardianEmail && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.guardianEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ADDITIONAL INFO & MEDICAL                                         */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Health & Medical Information
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Physical measurements and medical records
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Height (Inch)</label>
                  <input
                    type="number"
                    name="heightInch"
                    value={formData.heightInch}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Weight (Kg)</label>
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Blood Pressure</label>
                  <input
                    type="text"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Nutrition</label>
                  <select
                    name="nutrition"
                    value={formData.nutrition}
                    onChange={handleChange}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Good">Good</option>
                    <option value="Normal">Normal</option>
                    <option value="Needs Attention">Needs Attention</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Medical Conditions / Allergies
                </label>
                <textarea
                  rows={2}
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  placeholder="Specify any food/drug allergies, asthma, spectacles..."
                  className="w-full p-2.5 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] resize-none"
                />
              </div>

              {/* Logistics Facilities Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[var(--border-default)]">
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    name="isBus"
                    checked={formData.isBus}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  />
                  <span>Opt for School Bus Transport</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    name="isHostel"
                    checked={formData.isHostel}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  />
                  <span>Opt for Hostel Facility</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    name="wearsLens"
                    checked={formData.wearsLens}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  />
                  <span>Wears Spectacles / Contact Lens</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DOCUMENTS & PHOTO UPLOAD                                          */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Student Documents & Photographs
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Attach official verification certificates and passport-size photo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Photo Upload Box */}
                <div className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-[6px] p-4 text-center space-y-2 bg-[var(--neutral-50)]/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[var(--red-50)] text-[var(--brand-primary)] flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">Passport Photo</span>
                    <p className="text-[10px] text-[var(--neutral-500)]">PNG, JPG up to 5MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, studentPhotoUploaded: true })}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-100)]"
                  >
                    {formData.studentPhotoUploaded ? "✓ Photo Attached" : "Browse Photo"}
                  </button>
                </div>

                {/* Birth Certificate */}
                <div className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-[6px] p-4 text-center space-y-2 bg-[var(--neutral-50)]/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[var(--red-50)] text-[var(--brand-primary)] flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">Birth Certificate</span>
                    <p className="text-[10px] text-[var(--neutral-500)]">PDF or Image scan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, birthCertUploaded: true })}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-100)]"
                  >
                    {formData.birthCertUploaded ? "✓ Certificate Attached" : "Upload Document"}
                  </button>
                </div>

                {/* Transfer Certificate */}
                <div className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-[6px] p-4 text-center space-y-2 bg-[var(--neutral-50)]/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[var(--red-50)] text-[var(--brand-primary)] flex items-center justify-center">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">Transfer Certificate (TC)</span>
                    <p className="text-[10px] text-[var(--neutral-500)]">Previous school clearance</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tcUploaded: true })}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-100)]"
                  >
                    {formData.tcUploaded ? "✓ TC Document Attached" : "Upload TC"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Bottom Sticky Action Navigation Bar matching screenshot */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--border-default)] px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          {/* Left Actions: Cancel & Save as Draft */}
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.STUDENTS.ROOT}
              className="px-3.5 py-2 rounded-[4px] border border-[var(--border-default)] text-xs font-medium text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsDraftSaved(true);
                setTimeout(() => setIsDraftSaved(false), 3500);
              }}
              className="px-3.5 py-2 rounded-[4px] border border-[var(--brand-primary)] text-xs font-semibold text-[var(--brand-primary)] bg-[var(--red-50)]/40 hover:bg-[var(--red-50)] transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
          </div>

          {/* Right Actions: Previous & Next / Submit */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevious}
              className="px-3.5 py-2 rounded-[4px] border border-[var(--border-default)] text-xs font-semibold text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{currentStep === 5 ? "Submit Registration" : "Next"}</span>
              {currentStep < 5 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </footer>

      {/* Draft Saved Toast Notification */}
      {isDraftSaved && (
        <div className="fixed bottom-16 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-[6px] shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-200">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 pr-2">
            <p className="text-xs font-bold text-white">Draft Saved Locally</p>
            <p className="text-[11px] text-neutral-300">Your student admission data has been securely saved as a draft.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDraftSaved(false)}
            className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 6. Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-md bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Student Registered Successfully!
              </h2>
              <p className="text-xs text-[var(--neutral-500)]">
                {formData.firstName} {formData.lastName} has been enrolled in {formData.class} (Roll No: {formData.rollNumber}).
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push(ROUTES.STUDENTS.ROOT)}
                className="px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Go to Student Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Customize Fields Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-4 py-3 bg-[var(--brand-secondary)] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-[var(--brand-accent)]" />
                <span className="text-xs font-bold uppercase tracking-wider">Customize Form Fields</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1 text-[var(--neutral-400)] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[var(--neutral-600)]">
                Configure mandatory vs optional fields in the student admission form according to your school policy.
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {[
                  "Application Form No.",
                  "SGI No.",
                  "University Registration No.",
                  "Full Name Nepali",
                  "Ethnic Group & Caste",
                  "Citizenship / National ID No.",
                  "Blood Pressure & Medical Details",
                  "Parent Education & Annual Income",
                ].map((field) => (
                  <label
                    key={field}
                    className="flex items-center justify-between p-2 rounded border border-[var(--border-default)] text-xs text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
                  >
                    <span>{field}</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 bg-[var(--neutral-50)] border-t border-[var(--border-default)] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="px-3 py-1.5 rounded-[4px] bg-[var(--brand-primary)] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
