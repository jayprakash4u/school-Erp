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
  ChevronRight,
  ChevronLeft,
  X,
  UploadCloud,
  Check,
  SlidersHorizontal,
  AlertTriangle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  StudentFormSchema,
  FormFieldDef,
  SectionKey,
} from "@/types/form-schema";
import {
  INITIAL_STUDENT_FORM_SCHEMA,
  SCHEMA_STORAGE_KEY,
} from "@/config/student-form-schema";
import { FieldCustomizerModal } from "@/components/students/field-customizer-modal";
import { DynamicFieldRenderer } from "@/components/students/dynamic-field-renderer";

// Step Definitions
const STEPS = [
  { id: 1, label: "Personal & Admin", icon: User },
  { id: 2, label: "Academic", icon: GraduationCap },
  { id: 3, label: "Address & Guardian", icon: MapPin },
  { id: 4, label: "Additional Info", icon: FileText },
  { id: 5, label: "Documents", icon: Upload },
  { id: 6, label: "Custom Fields", icon: SlidersHorizontal },
];

interface StepValidationIssue {
  stepId: number;
  stepLabel: string;
  missingFields: string[];
}

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isCustomizeOpen, setIsCustomizeOpen] = React.useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState<boolean>(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = React.useState<boolean>(false);
  const [isDraftSaved, setIsDraftSaved] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Tracks if user attempted final registration submission
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState<boolean>(false);
  const [validationIssues, setValidationIssues] = React.useState<StepValidationIssue[]>([]);

  // Form Schema State (Loaded from LocalStorage or Defaults)
  const [formSchema, setFormSchema] = React.useState<StudentFormSchema>(
    INITIAL_STUDENT_FORM_SCHEMA
  );

  // Load saved schema on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(SCHEMA_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.activeFields && parsed.unusedFields) {
          setFormSchema(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load saved student form schema", err);
    }
  }, []);

  // Form Data State
  const [formData, setFormData] = React.useState<Record<string, any>>({
    // Administrative
    applicationFormNo: "AF-2083-" + Math.floor(100 + Math.random() * 900),
    sgiNo: "SGI-" + Math.floor(1000 + Math.random() * 9000),
    scholarship: "",
    quotaType: "General Quota",
    universityRegNo: "",
    registrationDateBS: "2083-01-15",
    registrationDateAD: new Date().toISOString().split("T")[0],

    // Personal
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

    // Contact
    mobile: "+977-98",
    email: "",
    bloodGroup: "O+",
    citizenshipNo: "",
    passportNo: "",
    nationalIdNo: "",

    // Academic Registration
    academicYear: "2026–27",
    department: "Computer Science & Engineering",
    program: "B.Tech CSE",
    class: "Grade 10",
    academicLevel: "Semester 1",
    section: "Section A",
    admissionDate: "2026-10-06",
    rollNumber: "105",
    batch: "2083/84",
    previousSchoolName: "Saraswati Secondary School",
    previousGradeGpa: "3.65 GPA",
    transferCertificateNo: "TC-2082-991",
    isPreviousStudent: false,

    // Address
    country: "Nepal",
    province: "Bagmati Province",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan",
    wardNo: "04",
    tole: "Baluwatar",
    address: "Baluwatar-4, Kathmandu",
    sameAsPermanent: true,

    // Guardian
    guardianName: "",
    relation: "Father",
    guardianMobile: "+977-98",
    guardianEmail: "",
    guardianOccupation: "Business / Professional",
    parentsEducation: "Bachelor's Degree",
    annualIncome: "NPR 1,200,000",

    // Medical & Additional
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

    // Documents
    studentPhotoUploaded: false,
    birthCertUploaded: false,
    tcUploaded: false,

    // Custom Fields Defaults
    previousRollNo: "",
    extracurricularInterests: "",
    alumniOrStaffReference: "",
    specialAdmissionRemarks: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Comprehensive multi-step validator
  const validateAllSteps = (): {
    isValid: boolean;
    stepIssues: StepValidationIssue[];
    allErrors: Record<string, string>;
  } => {
    const allErrors: Record<string, string> = {};
    const stepIssues: StepValidationIssue[] = [];

    STEPS.forEach((step) => {
      const stepSectionKeys: SectionKey[] = [];
      if (step.id === 1) stepSectionKeys.push("administrative", "personal", "contact");
      if (step.id === 2) stepSectionKeys.push("academic");
      if (step.id === 3) stepSectionKeys.push("address", "guardian");
      if (step.id === 4) stepSectionKeys.push("medical");
      if (step.id === 6) stepSectionKeys.push("custom_fields");

      const activeFieldsInStep = formSchema.activeFields.filter((f) =>
        stepSectionKeys.includes(f.section)
      );

      const missingInThisStep: string[] = [];

      for (const field of activeFieldsInStep) {
        const val = formData[field.key];

        // Required check
        if (field.required) {
          if (
            val === undefined ||
            val === null ||
            (typeof val === "string" && !val.trim()) ||
            (field.type === "phone" && val === "+977-98")
          ) {
            allErrors[field.key] = `${field.label} is compulsory.`;
            missingInThisStep.push(field.label);
            continue;
          }
        }

        // Email format check
        if (field.type === "email" && val && typeof val === "string" && val.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
            allErrors[field.key] = "Please enter a valid email address.";
            missingInThisStep.push(`${field.label} (Invalid Email)`);
          }
        }
      }

      if (missingInThisStep.length > 0) {
        stepIssues.push({
          stepId: step.id,
          stepLabel: step.label,
          missingFields: missingInThisStep,
        });
      }
    });

    return {
      isValid: stepIssues.length === 0,
      stepIssues,
      allErrors,
    };
  };

  const handleFieldChange = (key: string, value: any) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Free Step Navigation without blocking!
  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final Submit on last step
      handleSubmitRegistration();
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allows completely free navigation to any step
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Submission Handler
  const handleSubmitRegistration = () => {
    setHasAttemptedSubmit(true);
    const { isValid, stepIssues, allErrors } = validateAllSteps();

    setErrors(allErrors);
    setValidationIssues(stepIssues);

    if (isValid) {
      setIsSuccessModalOpen(true);
    } else {
      setIsValidationModalOpen(true);
    }
  };

  // Jump to a specific step from the validation modal
  const handleJumpToStep = (stepId: number) => {
    setIsValidationModalOpen(false);
    setCurrentStep(stepId);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Schema Handlers
  const handleSaveSchema = (newSchema: StudentFormSchema) => {
    setFormSchema(newSchema);
    try {
      localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(newSchema));
    } catch (err) {
      console.error("Failed to persist schema", err);
    }
    showToast("Form Layout & Custom Fields saved successfully!");
  };

  const handleResetSchemaToDefault = () => {
    setFormSchema(INITIAL_STUDENT_FORM_SCHEMA);
    try {
      localStorage.removeItem(SCHEMA_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to reset schema", err);
    }
    showToast("Reset form layout to default school settings.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to get active fields for a section
  const getSectionActiveFields = (sectionKey: SectionKey): FormFieldDef[] => {
    return formSchema.activeFields
      .filter((f) => f.section === sectionKey)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Calculate issue count for a specific step
  const getStepIssues = (stepId: number) => {
    return validationIssues.find((issue) => issue.stepId === stepId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none pb-24">
      {/* 1. Global Top Header */}
      <ErpHeader />

      {/* 2. Global 2-Row Navigation Bar */}
      <ErpTopNav activeModuleId="students" />

      {/* 3. Main Form Workspace Canvas */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Top Header Bar */}
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
                Register a new student in the system (compulsory fields can be completed in any step before final registration)
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

        {/* Incomplete Submission Alert Banner if attempted */}
        {hasAttemptedSubmit && validationIssues.length > 0 && (
          <div className="p-4 rounded-[6px] bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 shadow-2xs animate-in fade-in-0 duration-200">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-900">
                  Compulsory Fields Incomplete ({validationIssues.reduce((acc, i) => acc + i.missingFields.length, 0)} missing)
                </p>
                <p className="text-[11px] text-rose-700">
                  Some required fields marked with an asterisk (*) in {validationIssues.length} step(s) need to be filled before registration can be finalized.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsValidationModalOpen(true)}
              className="px-3 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>View Incomplete List</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 4. Multi-Step Tab Navigation Bar with Dynamic Status Badges */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-3">
          <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const issueForStep = hasAttemptedSubmit ? getStepIssues(step.id) : null;
              const isStepComplete = hasAttemptedSubmit && !issueForStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    "flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-medium transition-all duration-150 cursor-pointer border select-none relative",
                    isActive
                      ? "bg-[var(--red-50)] text-[var(--brand-primary)] font-bold border-[var(--brand-primary)] shadow-2xs"
                      : issueForStep
                      ? "bg-rose-50/50 text-rose-700 border-rose-200 hover:bg-rose-50"
                      : "bg-white text-[var(--neutral-700)] border-[var(--border-default)] hover:bg-[var(--neutral-50)]"
                  )}
                >
                  <StepIcon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive
                        ? "text-[var(--brand-primary)]"
                        : issueForStep
                        ? "text-rose-600"
                        : isStepComplete
                        ? "text-emerald-600"
                        : "text-[var(--neutral-500)]"
                    )}
                  />
                  <span className="truncate">{step.label}</span>

                  {/* Dynamic Indicators */}
                  {issueForStep ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                      {issueForStep.missingFields.length} missing
                    </span>
                  ) : isStepComplete ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-0.5 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: ADMINISTRATIVE, PERSONAL & CONTACT INFORMATION                   */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Section 1: Administrative Information */}
            {getSectionActiveFields("administrative").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Administrative Information
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Official use only - Registration and administrative details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("administrative").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Student Personal Information */}
            {getSectionActiveFields("personal").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Student Personal Information
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Highly preferred for report and demographic purpose
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("personal").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Contact Information */}
            {getSectionActiveFields("contact").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Contact Information
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Mandatory selection for email and mobile number for communication purpose
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("contact").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ACADEMIC DETAILS                                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {getSectionActiveFields("academic").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Academic Registration
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Academic year, department, program, class/grade, level, section, and admission date
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("academic").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ADDRESS & GUARDIAN DETAILS                                        */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Address Information */}
            {getSectionActiveFields("address").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Address Information
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Permanent residential and location details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("address").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Guardian Information */}
            {getSectionActiveFields("guardian").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Guardian & Family Information
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Primary contact person, parent details, and emergency contact
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("guardian").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ADDITIONAL & MEDICAL DETAILS                                      */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {getSectionActiveFields("medical").length > 0 && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Additional & Medical Details
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Health records, transport, hostel, and special accommodations
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("medical").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DOCUMENTS & PHOTO ATTACHMENT                                      */}
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
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Passport Photo
                    </span>
                    <p className="text-[10px] text-[var(--neutral-500)]">PNG, JPG up to 5MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        "studentPhotoUploaded",
                        !formData.studentPhotoUploaded
                      )
                    }
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-100)] cursor-pointer"
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
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Birth Certificate
                    </span>
                    <p className="text-[10px] text-[var(--neutral-500)]">PDF or Image scan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        "birthCertUploaded",
                        !formData.birthCertUploaded
                      )
                    }
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-100)] cursor-pointer"
                  >
                    {formData.birthCertUploaded
                      ? "✓ Certificate Attached"
                      : "Upload Document"}
                  </button>
                </div>

                {/* Transfer Certificate */}
                <div className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-[6px] p-4 text-center space-y-2 bg-[var(--neutral-50)]/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[var(--red-50)] text-[var(--brand-primary)] flex items-center justify-center">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Transfer Certificate (TC)
                    </span>
                    <p className="text-[10px] text-[var(--neutral-500)]">
                      Previous school clearance
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange("tcUploaded", !formData.tcUploaded)
                    }
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-100)] cursor-pointer"
                  >
                    {formData.tcUploaded ? "✓ TC Document Attached" : "Upload TC"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: CUSTOM FIELDS & INSTITUTION-SPECIFIC DATA                         */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="border-b border-[var(--border-default)] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      Custom Fields & Additional Data
                    </h2>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Step 6
                    </span>
                  </div>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Additional institutional fields, extra remarks, and custom attributes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(true)}
                  className="px-3 py-1.5 rounded-[4px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 hover:bg-[var(--red-50)]/80 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs transition-colors"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>Configure / Add More Fields</span>
                </button>
              </div>

              {getSectionActiveFields("custom_fields").length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSectionActiveFields("custom_fields").map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.key]}
                      onChange={handleFieldChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 border-2 border-dashed border-[var(--border-default)] rounded-[6px] flex flex-col items-center justify-center text-center space-y-3 bg-[var(--neutral-50)]/30">
                  <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                    <SlidersHorizontal className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      No Custom Fields Configured for Step 6
                    </h3>
                    <p className="text-xs text-[var(--neutral-500)]">
                      You can add custom fields (e.g. Previous School Exam ID, Special Concession,
                      Club Membership) for this school anytime.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(true)}
                    className="px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>Open Field Customizer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 5. Bottom Sticky Action Navigation Bar */}
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

          {/* Right Actions: Previous & Next / Submit / Go to Custom Fields */}
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

            {currentStep === 5 ? (
              <>
                {/* Step 5 Option A: Proceed to Custom Fields (Optional) */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(6);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-[4px] border border-[var(--brand-primary)] text-xs font-semibold text-[var(--brand-primary)] bg-[var(--red-50)]/40 hover:bg-[var(--red-50)] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Custom Fields (Optional)</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Step 5 Option B: Direct Submit Registration */}
                <button
                  type="button"
                  onClick={handleSubmitRegistration}
                  className="px-4 py-2 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Submit Registration</span>
                </button>
              </>
            ) : currentStep === 6 ? (
              /* Step 6: Final Submit Registration */
              <button
                type="button"
                onClick={handleSubmitRegistration}
                className="px-5 py-2 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Submit Registration</span>
              </button>
            ) : (
              /* Steps 1 to 4: Standard Next */
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* INCOMPLETE MANDATORY FIELDS SUMMARY MODAL                             */}
      {/* ===================================================================== */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold">Compulsory Fields Incomplete</h3>
                  <p className="text-[11px] text-rose-100">
                    Please fill the mandatory fields (*) to register this student
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsValidationModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of Incomplete Steps */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-[var(--neutral-600)]">
                The following {validationIssues.reduce((acc, i) => acc + i.missingFields.length, 0)} required field(s) across {validationIssues.length} step(s) are missing:
              </p>

              <div className="space-y-3">
                {validationIssues.map((issue) => (
                  <div
                    key={issue.stepId}
                    className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--neutral-50)]/50 hover:bg-white transition-colors space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {issue.stepId}
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          Step {issue.stepId}: {issue.stepLabel}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleJumpToStep(issue.stepId)}
                        className="px-2.5 py-1 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Go to Step {issue.stepId}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {issue.missingFields.map((fName, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-[3px] bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold"
                        >
                          * {fName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[var(--neutral-50)] border-t border-[var(--border-default)] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsValidationModalOpen(false)}
                className="px-4 py-2 rounded-[4px] border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors cursor-pointer"
              >
                Dismiss & Review
              </button>
              {validationIssues.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleJumpToStep(validationIssues[0].stepId)}
                  className="px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Jump to Step {validationIssues[0].stepId}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification (Custom feedback) */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-[6px] shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-200">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium text-white pr-2">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Draft Saved Notification */}
      {isDraftSaved && (
        <div className="fixed bottom-16 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-[6px] shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-200">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 pr-2">
            <p className="text-xs font-bold text-white">Draft Saved Locally</p>
            <p className="text-[11px] text-neutral-300">
              Your student admission data has been securely saved as a draft.
            </p>
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

      {/* Success Modal */}
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

      {/* Comprehensive Dynamic Field Customizer Modal */}
      <FieldCustomizerModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        schema={formSchema}
        onSave={handleSaveSchema}
        onResetToDefault={handleResetSchemaToDefault}
      />
    </div>
  );
}
