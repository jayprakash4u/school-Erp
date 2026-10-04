import {
  InvoiceSetupConfig,
  InvoiceTemplateConfig,
  DEFAULT_INVOICE_SETUP,
  DEFAULT_INVOICE_TEMPLATE,
} from "@/types/invoice-setup";

const SETUP_STORAGE_KEY = "school_erp_invoice_setup_v1";
const TEMPLATE_STORAGE_KEY = "school_erp_invoice_template_v1";

export function getStoredInvoiceSetup(): InvoiceSetupConfig {
  if (typeof window === "undefined") return DEFAULT_INVOICE_SETUP;
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) return DEFAULT_INVOICE_SETUP;
    return { ...DEFAULT_INVOICE_SETUP, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to parse invoice setup from localStorage", e);
    return DEFAULT_INVOICE_SETUP;
  }
}

export function saveStoredInvoiceSetup(config: InvoiceSetupConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save invoice setup to localStorage", e);
  }
}

export function getStoredInvoiceTemplate(): InvoiceTemplateConfig {
  if (typeof window === "undefined") return DEFAULT_INVOICE_TEMPLATE;
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return DEFAULT_INVOICE_TEMPLATE;
    return { ...DEFAULT_INVOICE_TEMPLATE, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to parse invoice template from localStorage", e);
    return DEFAULT_INVOICE_TEMPLATE;
  }
}

export function saveStoredInvoiceTemplate(config: InvoiceTemplateConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save invoice template to localStorage", e);
  }
}
