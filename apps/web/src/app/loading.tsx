import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <Spinner size="lg" className="text-[var(--brand-primary)]" />
      </div>
      <p className="text-xs font-medium text-[var(--text-tertiary)] animate-pulse">
        Loading ERP module...
      </p>
    </div>
  );
}
