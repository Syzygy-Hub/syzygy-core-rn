// Validation
// Composable field validators, rule chaining, form-level validation pipeline, built-in rules.

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export interface FieldValidator<T> {
  validate(value: T): ValidationResult;
}

export class ValidationPipeline<T> implements FieldValidator<T> {
  constructor(private readonly validators: FieldValidator<T>[]) {}

  // TODO: short-circuit / collect-all modes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(_value: T): ValidationResult {
    return { valid: true };
  }
}
