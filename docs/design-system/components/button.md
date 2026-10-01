# Button Component Specification

## Variants
- `primary`: Red `#DC2626` background, white text. Main action on any screen.
- `secondary`: White background, `#D4D4D4` border, `#171717` text. Cancel / secondary actions.
- `destructive`: Dark red `#B91C1C` background, white text. Delete school, remove student.
- `ghost`: Transparent background, `#404040` text, subtle hover.
- `outline`: Transparent background, `#E5E5E5` border.
- `link`: Red `#B91C1C` text, underline on hover.

## Sizes
- `sm`: Height 32px (`h-8`), padding 12px (`px-3`), font size 12px.
- `md`: Height 40px (`h-10`), padding 16px (`px-4`), font size 14px (Default).
- `lg`: Height 44px (`h-11`), padding 24px (`px-6`), font size 16px.
- `icon`: Square 36px x 36px (`h-9 w-9`), centered icon.

## Usage Example
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" onClick={handleSave}>
  Save Changes
</Button>
```
