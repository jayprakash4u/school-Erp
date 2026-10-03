export type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "select"
  | "checkbox"
  | "textarea";

export type SectionKey =
  | "administrative"
  | "personal"
  | "contact"
  | "academic"
  | "address"
  | "guardian"
  | "medical"
  | "documents"
  | "custom_fields";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldDef {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  section: SectionKey;
  placeholder?: string;
  options?: FormFieldOption[]; // For select types
  isCustom?: boolean;
  systemLocked?: boolean; // If true, cannot be removed from required (like First Name, Last Name)
  gridCols?: 1 | 2 | 3;
  helpText?: string;
  order: number;
}

export interface FormSectionDef {
  key: SectionKey;
  title: string;
  description: string;
  step: number;
  iconName: string;
}

export interface StudentFormSchema {
  version: number;
  sections: FormSectionDef[];
  activeFields: FormFieldDef[];
  unusedFields: FormFieldDef[];
}
