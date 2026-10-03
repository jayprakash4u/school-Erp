# Form & Validation Architecture

The School ERP Form System uses **React Hook Form**, **Zod**, and semantic design tokens.

---

## Architecture Flow

```text
User Input ───► Zod Client Validation ───► Submit Handler
                                                │
                                                ├── Success ──► Success Toast / State Reset
                                                │
                                                └── 400 Bad Request (.NET Web API)
                                                        │
                                                        ▼
                                       handleServerValidationErrors()
                                                        │
                                                        ▼
                                        Inline Field Errors / Global Alert
```

---

## 1. Client-Side Validation (`useZodForm`)

```tsx
import { z } from "zod";
import { useZodForm } from "@/hooks";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Input,
  Button,
} from "@/components/ui";
import { emailValidator, requiredString } from "@/lib/validators";

const schoolFormSchema = z.object({
  name: requiredString("School Name", 3, 150),
  code: requiredString("School Code", 2, 20),
  email: emailValidator,
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export function SchoolCreateForm() {
  const form = useZodForm({
    schema: schoolFormSchema,
    defaultValues: {
      name: "",
      code: "",
      email: "",
    },
  });

  const onSubmit = async (values: SchoolFormValues) => {
    // Submit logic
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>School Name</FormLabel>
              <FormControl>
                <Input placeholder="Springdale Academy" {...field} />
              </FormControl>
              <FormDescription>Official legal name of the institution.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={form.formState.isSubmitting}
        >
          Register School
        </Button>
      </form>
    </Form>
  );
}
```

---

## 2. Server Validation Error Mapping

When ASP.NET Core returns `400 Bad Request` with FluentValidation errors:

```tsx
import { apiClient } from "@/services/api-client";
import { handleServerValidationErrors } from "@/lib/form-utils";
import { useToast } from "@/components/ui";

const onSubmit = async (values: SchoolFormValues) => {
  try {
    await apiClient.post("/schools", values);
    toast({ type: "success", title: "School Registered Successfully" });
  } catch (err: any) {
    const { hasMappedErrors, unmappedErrors } = handleServerValidationErrors(
      err,
      form.setError
    );

    if (!hasMappedErrors && unmappedErrors.length > 0) {
      toast({
        type: "error",
        title: "Registration Failed",
        message: unmappedErrors.join(", "),
      });
    }
  }
};
```

---

## 3. Form Features Checklist

- [x] **Client-side validation**: Instant feedback on blur/change with Zod schemas.
- [x] **Server-side validation binding**: Auto-attaches .NET Web API field error messages to respective inputs.
- [x] **Required indicators**: Automatic red `*` on `FormLabel` with `required` prop.
- [x] **Accessibility**: Linked IDs, `aria-invalid`, `aria-describedby` across labels, controls, descriptions, and error messages.
- [x] **Loading & Submitting states**: `isSubmitting` integration with `Button`'s `isLoading` spinner.
- [x] **Success messaging**: Global `useToast` feedback and alert integration.
