import { useForm, UseFormProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface UseZodFormProps<TValues extends FieldValues = FieldValues>
  extends Omit<UseFormProps<TValues>, "resolver"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<TValues, any, any>;
}

/**
 * Type-safe React Hook Form wrapper pre-configured with Zod schema resolution.
 */
export function useZodForm<TValues extends FieldValues = FieldValues>({
  schema,
  mode = "onBlur",
  reValidateMode = "onChange",
  ...props
}: UseZodFormProps<TValues>) {
  return useForm<TValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    mode,
    reValidateMode,
    ...props,
  });
}
