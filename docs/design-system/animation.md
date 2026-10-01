# Animation & Responsive Breakpoints

## Animation Standards

### Durations
- `instant`: `0ms`
- `fast`: `100ms` (Icon toggles, hover feedback)
- `normal`: `150ms` (Button hover, dropdown open)
- `moderate`: `200ms` (Modal appearance, tab switches)
- `slow`: `300ms` (Sidebar slide, drawer open)

### Easing Functions
- `ease-out`: Used for entering elements.
- `ease-in-out`: Used for state transitions.

### Accessibility
All components respect `prefers-reduced-motion` media queries.

---

## Responsive Breakpoints & Viewport Constraints

| Breakpoint | Width | ERP Layout Behavior |
| :--- | :--- | :--- |
| `sm` | `640px` | Single column forms, stacked metrics |
| `md` | `768px` | Collapsible sidebar, 2-column forms |
| `lg` | `1024px` | Persistent sidebar, 4-column metric cards |
| `xl` | `1280px` | Full ERP data tables with multi-filters |
| `2xl` | `1536px` | Max-width container capped at **1440px** for high data density |
