# Form Inputs & Table & Modal Specifications

## Form Input Specification
- Radius: `6px` (`rounded-md`)
- Normal: Background `#FFFFFF`, Border `#D4D4D4`, Text `#171717`, Placeholder `#A3A3A3`
- Hover: Border `#A3A3A3`
- Focus: Border `#DC2626`, Focus ring `#FECACA` (3px ring)
- Error: Border `#DC2626`, Background `#FEF2F2`, Text `#B91C1C`
- Disabled: Background `#F5F5F5`, Border `#E5E5E5`, Text `#A3A3A3`

```tsx
import { Input } from "@/components/ui/input";

<Input
  label="School Name"
  placeholder="Enter school name"
  error={errors.schoolName}
  helperText="Official registered institution name"
/>
```

---

## ERP Table System
- Header: `#F5F5F5` background, uppercase 11px font (`text-overline`), secondary text `#737373`
- Row: `#FFFFFF` background, hover `#FAFAFA`, border `#E5E5E5`
- Selected Row: Background `#FEF2F2`, Border `#FECACA`
- Integrated Pagination: 10/25/50/100 item limits, range summary, fast jumping.

```tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
```

---

## Modal / Dialog Specification
- Overlay: `rgba(0, 0, 0, 0.50)` backdrop blur
- Panel: `#FFFFFF` background, 12px radius (`rounded-xl`), `#E5E5E5` border, `shadow-xl`
- Z-Index: 1300 (`z-modal`)
- Keyboard: Escape dismiss, scroll lock enabled.

```tsx
import { Dialog } from "@/components/ui/dialog";

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete School Branch"
  description="This action cannot be undone."
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete School</Button>
    </>
  }
>
  <p>Are you sure you want to delete this campus and all associated records?</p>
</Dialog>
```
