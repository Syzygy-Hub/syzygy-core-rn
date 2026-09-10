/**
 * Composable validation pipeline with built-in validators.
 * Uses Foundation's ValidationResult and ValidationRule types.
 */

import { ValidationResult, ValidationRule } from 'syzygy-foundation-rn';

export type { ValidationResult, ValidationRule };

/** Controls how a validation pipeline reports failures. */
export enum ValidationMode {
  /** Stop at the first failure. */
  ShortCircuit = 'shortCircuit',
  /** Run all validators and collect all failures. */
  CollectAll = 'collectAll',
}

/** Validates that a string value is present and non-empty. */
export class RequiredValidator implements ValidationRule<string | null | undefined> {
  /** Validate that the value is not null, undefined, or empty. */
  validate(value: string | null | undefined): ValidationResult {
    if (value === null || value === undefined || value.trim().length === 0) {
      return ValidationResult.invalid(['Value is required']);
    }
    return ValidationResult.valid();
  }
}

/** Validates that a string meets a minimum length. */
export class MinLengthValidator implements ValidationRule<string> {
  private readonly min: number;

  constructor(min: number) {
    this.min = min;
  }

  /** Validate that the string length is at least the minimum. */
  validate(value: string): ValidationResult {
    if (value.length < this.min) {
      return ValidationResult.invalid([`Must be at least ${this.min} characters`]);
    }
    return ValidationResult.valid();
  }
}

/** Validates that a string does not exceed a maximum length. */
export class MaxLengthValidator implements ValidationRule<string> {
  private readonly max: number;

  constructor(max: number) {
    this.max = max;
  }

  /** Validate that the string length does not exceed the maximum. */
  validate(value: string): ValidationResult {
    if (value.length > this.max) {
      return ValidationResult.invalid([`Must be at most ${this.max} characters`]);
    }
    return ValidationResult.valid();
  }
}

/** Validates that a string is a well-formed email address. */
export class EmailValidator implements ValidationRule<string> {
  private readonly pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /** Validate that the string matches a basic email pattern. */
  validate(value: string): ValidationResult {
    if (!this.pattern.test(value)) {
      return ValidationResult.invalid(['Invalid email address']);
    }
    return ValidationResult.valid();
  }
}

/** Validates that a string matches a regular expression. */
export class RegexValidator implements ValidationRule<string> {
  private readonly pattern: RegExp;
  private readonly errorMessage: string;

  constructor(pattern: RegExp, errorMessage: string = 'Value does not match the required pattern') {
    this.pattern = pattern;
    this.errorMessage = errorMessage;
  }

  /** Validate that the string matches the pattern. */
  validate(value: string): ValidationResult {
    if (!this.pattern.test(value)) {
      return ValidationResult.invalid([this.errorMessage]);
    }
    return ValidationResult.valid();
  }
}

/**
 * Pipeline that runs multiple validators in sequence.
 *
 * @typeParam T - The type of value being validated.
 *
 * @example
 * ```typescript
 * const pipeline = new ValidationPipeline<string>(ValidationMode.CollectAll)
 *   .add(new MinLengthValidator(3))
 *   .add(new MaxLengthValidator(20));
 * pipeline.validate('ab'); // { kind: 'invalid', isValid: false, messages: ['Must be at least 3 characters'] }
 * ```
 */
export class ValidationPipeline<T> implements ValidationRule<T> {
  private validators: ValidationRule<T>[] = [];
  private mode: ValidationMode;

  constructor(mode: ValidationMode = ValidationMode.ShortCircuit) {
    this.mode = mode;
  }

  /**
   * Add a validator to the pipeline.
   * @param validator - The validator to add.
   * @returns This pipeline for chaining.
   */
  add(validator: ValidationRule<T>): this {
    this.validators.push(validator);
    return this;
  }

  /**
   * Run all validators against the value.
   * @param value - The value to validate.
   * @returns A validation result. In CollectAll mode, all failure messages are collected into one Invalid.
   */
  validate(value: T): ValidationResult {
    const errors: string[] = [];
    for (const validator of this.validators) {
      const result = validator.validate(value);
      if (result.kind === 'invalid') {
        if (this.mode === ValidationMode.ShortCircuit) {
          return result;
        }
        errors.push(...result.messages);
      }
    }
    if (errors.length > 0) {
      return ValidationResult.invalid(errors);
    }
    return ValidationResult.valid();
  }
}
