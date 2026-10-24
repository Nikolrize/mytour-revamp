import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PasswordFieldsProps } from "@/lib/type";

// Registration bindings keep this reusable across independent account forms.
export function PasswordFields({
  idPrefix,
  password,
  confirmation,
  disabled = false,
  passwordLabel = "New password",
  confirmLabel = "Confirm new password",
  description,
  passwordError,
  confirmError,
}: PasswordFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-password`}>{passwordLabel}</Label>
        <Input
          {...password}
          id={`${idPrefix}-password`}
          type="password"
          autoComplete="new-password"
          maxLength={128}
          disabled={disabled}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={
            [
              description && `${idPrefix}-description`,
              passwordError && `${idPrefix}-password-error`,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {description && (
          <p
            id={`${idPrefix}-description`}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        )}
        <FieldError id={`${idPrefix}-password-error`}>
          {passwordError}
        </FieldError>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-confirmation`}>{confirmLabel}</Label>
        <Input
          {...confirmation}
          id={`${idPrefix}-confirmation`}
          type="password"
          autoComplete="new-password"
          maxLength={128}
          disabled={disabled}
          aria-invalid={Boolean(confirmError)}
          aria-describedby={
            confirmError ? `${idPrefix}-confirmation-error` : undefined
          }
        />
        <FieldError id={`${idPrefix}-confirmation-error`}>
          {confirmError}
        </FieldError>
      </div>
    </>
  );
}
