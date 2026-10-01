# School ERP Core UI Components Reference

Complete documentation for the 18 foundation UI components built for the School ERP.

---

### 1. Button
- **File**: `src/components/ui/button.tsx`
- **Variants**: `primary`, `secondary`, `destructive`, `ghost`, `outline`, `link`
- **Sizes**: `sm` (32px), `md` (40px), `lg` (44px), `icon` (36x36px)
- **Props**: `isLoading?: boolean`, standard HTML button props
- **Radius**: `radius-md` (6px)

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" isLoading={isSaving}>
  Save Changes
</Button>
```

---

### 2. Input
- **File**: `src/components/ui/input.tsx`
- **Props**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`
- **Tokens**: Normal `#FFFFFF` / `#D4D4D4`, Focus `#DC2626` / Ring `#FECACA`, Error `#FEF2F2` / `#DC2626`
- **Radius**: `radius-md` (6px)

```tsx
import { Input } from "@/components/ui";

<Input
  label="School Name"
  placeholder="Enter school name"
  error={formErrors.name}
  leftIcon={<School className="h-4 w-4" />}
/>
```

---

### 3. Textarea
- **File**: `src/components/ui/textarea.tsx`
- **Props**: `label`, `error`, `helperText`, `maxLength`, `showCount`, `rows`
- **Radius**: `radius-md` (6px)

```tsx
import { Textarea } from "@/components/ui";

<Textarea
  label="Admission Notes"
  placeholder="Enter student background notes..."
  maxLength={500}
  showCount
/>
```

---

### 4. Select
- **File**: `src/components/ui/select.tsx`
- **Props**: `label`, `error`, `helperText`, `options: { label, value }[]`
- **Radius**: `radius-md` (6px)

```tsx
import { Select } from "@/components/ui";

<Select
  label="Academic Year"
  options={[
    { label: "2026-2027", value: "2026-2027" },
    { label: "2025-2026", value: "2025-2026" },
  ]}
/>
```

---

### 5. Checkbox
- **File**: `src/components/ui/checkbox.tsx`
- **Props**: `label`, `description`, `checked`, `onChange`
- **Radius**: `radius-sm` (4px)

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox
  label="Send SMS notification to parents"
  description="Automated SMS will be dispatched immediately"
  checked={sendSms}
  onChange={(e) => setSendSms(e.target.checked)}
/>
```

---

### 6. Radio & RadioGroup
- **File**: `src/components/ui/radio.tsx`
- **Props**: `label`, `options: { label, value, description }[]`, `value`, `onChange`, `direction`

```tsx
import { RadioGroup } from "@/components/ui";

<RadioGroup
  label="Fee Payment Mode"
  options={[
    { label: "Online Banking / Card", value: "online" },
    { label: "Cash / Cheque", value: "offline" },
  ]}
  value={paymentMode}
  onChange={setPaymentMode}
/>
```

---

### 7. Badge
- **File**: `src/components/ui/badge.tsx`
- **Variants**: `active`, `inactive`, `pending`, `suspended`, `brand`, `info`, `warning`
- **Props**: `dot?: boolean`, `size?: "sm" | "md"`
- **Radius**: `radius-full` (9999px)

```tsx
import { Badge } from "@/components/ui";

<Badge variant="active" dot>Active Student</Badge>
<Badge variant="pending" dot>Pending Fees</Badge>
```

---

### 8. Card
- **File**: `src/components/ui/card.tsx`
- **Sub-components**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Radius**: `radius-lg` (8px)

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>Attendance Summary</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

---

### 9. Dialog (Modal)
- **File**: `src/components/ui/dialog.tsx`
- **Props**: `isOpen`, `onClose`, `title`, `description`, `footer`, `maxWidth`
- **Z-Index**: `z-modal` (1300), overlay `z-overlay` (1200)
- **Radius**: `radius-xl` (12px)

```tsx
import { Dialog, Button } from "@/components/ui";

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete School Branch"
  description="This operation cannot be undone."
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  Confirm school deletion.
</Dialog>
```

---

### 10. Drawer (Slide-over)
- **File**: `src/components/ui/drawer.tsx`
- **Props**: `isOpen`, `onClose`, `title`, `position: "left" | "right"`, `size`
- **Z-Index**: 1300

```tsx
import { Drawer } from "@/components/ui";

<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Student Quick Profile">
  Profile details...
</Drawer>
```

---

### 11. Dropdown
- **File**: `src/components/ui/dropdown.tsx`
- **Props**: `trigger`, `items: { label, icon, onClick, destructive, divider }[]`, `align`
- **Z-Index**: `z-dropdown` (1000)

```tsx
import { Dropdown, Button } from "@/components/ui";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

<Dropdown
  trigger={<Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>}
  items={[
    { label: "Edit Record", icon: Edit, onClick: handleEdit },
    { label: "Delete Record", icon: Trash2, destructive: true, onClick: handleDelete },
  ]}
/>
```

---

### 12. Tooltip
- **File**: `src/components/ui/tooltip.tsx`
- **Props**: `content`, `position: "top" | "bottom" | "left" | "right"`, `delay`
- **Z-Index**: `z-tooltip` (1600)

```tsx
import { Tooltip, Button } from "@/components/ui";

<Tooltip content="Print Invoices">
  <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
</Tooltip>
```

---

### 13. Table
- **File**: `src/components/ui/table.tsx`
- **Sub-components**: `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
- **Tokens**: Header `#F5F5F5`, Row `#FFFFFF`, Hover `#FAFAFA`, Selected `#FEF2F2` / `#FECACA`

```tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Student ID</TableHead>
      <TableHead>Full Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>STU-1001</TableCell>
      <TableCell>Alex Morgan</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 14. Pagination
- **File**: `src/components/ui/pagination.tsx`
- **Props**: `currentPage`, `totalPages`, `totalCount`, `pageSize`, `onPageChange`, `onPageSizeChange`

```tsx
import { Pagination } from "@/components/ui";

<Pagination
  currentPage={page}
  totalPages={10}
  totalCount={240}
  pageSize={25}
  onPageChange={setPage}
/>
```

---

### 15. Tabs
- **File**: `src/components/ui/tabs.tsx`
- **Variants**: `underline`, `pills`
- **Props**: `tabs: { id, label, count, icon }[]`, `activeTab`, `onChange`

```tsx
import { Tabs } from "@/components/ui";

<Tabs
  tabs={[
    { id: "overview", label: "Overview" },
    { id: "fees", label: "Fee History", count: 3 },
    { id: "attendance", label: "Attendance" },
  ]}
  activeTab={currentTab}
  onChange={setCurrentTab}
/>
```

---

### 16. Skeleton
- **File**: `src/components/ui/skeleton.tsx`
- **Props**: standard div props with animated pulse background `#E5E5E5`

```tsx
import { Skeleton } from "@/components/ui";

<Skeleton className="h-8 w-48" />
<Skeleton className="h-4 w-full" />
```

---

### 17. Loader / Spinner
- **File**: `src/components/ui/spinner.tsx`
- **Props**: `size?: "sm" | "md" | "lg"`

```tsx
import { Loader, Spinner } from "@/components/ui";

<Spinner size="md" />
```

---

### 18. Empty State
- **File**: `src/components/ui/empty-state.tsx`
- **Props**: `icon`, `title`, `description`, `action`, `secondaryAction`

```tsx
import { EmptyState, Button } from "@/components/ui";
import { UserX, Plus } from "lucide-react";

<EmptyState
  icon={UserX}
  title="No students found"
  description="No student records match your current filter criteria."
  action={<Button variant="primary"><Plus className="h-4 w-4" /> Add Student</Button>}
/>
```
