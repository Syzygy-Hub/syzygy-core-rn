import {
  RequiredValidator, MinLengthValidator, MaxLengthValidator,
  EmailValidator, RegexValidator, ValidationPipeline, ValidationMode,
} from '../../validation/Validator';

describe('Validation', () => {
  it('RequiredValidator rejects empty/null/undefined', () => {
    const v = new RequiredValidator();
    expect(v.validate(null).isValid).toBe(false);
    expect(v.validate(undefined).isValid).toBe(false);
    expect(v.validate('  ').isValid).toBe(false);
    expect(v.validate('hello').isValid).toBe(true);
  });

  it('MinLength and MaxLength validators', () => {
    expect(new MinLengthValidator(3).validate('ab').isValid).toBe(false);
    expect(new MinLengthValidator(3).validate('abc').isValid).toBe(true);
    expect(new MaxLengthValidator(5).validate('abcdef').isValid).toBe(false);
    expect(new MaxLengthValidator(5).validate('abcde').isValid).toBe(true);
  });

  it('EmailValidator accepts valid and rejects invalid emails', () => {
    const v = new EmailValidator();
    expect(v.validate('user@example.com').isValid).toBe(true);
    expect(v.validate('bad').isValid).toBe(false);
    expect(v.validate('@no-local.com').isValid).toBe(false);
  });

  it('RegexValidator works with custom patterns', () => {
    const v = new RegexValidator(/^\d{3}$/, 'Must be 3 digits');
    expect(v.validate('123').isValid).toBe(true);
    const result = v.validate('12');
    expect(result.isValid).toBe(false);
    if (result.kind === 'invalid') expect(result.messages[0]).toBe('Must be 3 digits');
  });

  it('ValidationPipeline short-circuits on first failure', () => {
    const pipeline = new ValidationPipeline<string>(ValidationMode.ShortCircuit)
      .add(new MinLengthValidator(5))
      .add(new MaxLengthValidator(3));
    const result = pipeline.validate('ab');
    expect(result.isValid).toBe(false);
    if (result.kind === 'invalid') expect(result.messages[0]).toContain('at least 5');
  });

  it('strict mode accepts valid email', () => {
    const v = new EmailValidator(true);
    expect(v.validate('user@example.com').isValid).toBe(true);
  });

  it('strict mode rejects local part over 64 chars', () => {
    const v = new EmailValidator(true);
    const local = 'a'.repeat(65);
    expect(v.validate(`${local}@example.com`).isValid).toBe(false);
  });

  it('strict mode rejects total length over 255', () => {
    const v = new EmailValidator(true);
    const domain = 'b'.repeat(248);
    expect(v.validate(`user@${domain}.com`).isValid).toBe(false);
  });

  it('strict mode rejects consecutive dots', () => {
    const v = new EmailValidator(true);
    expect(v.validate('user..name@example.com').isValid).toBe(false);
  });

  it('ValidationPipeline collects all errors in CollectAll mode', () => {
    const pipeline = new ValidationPipeline<string>(ValidationMode.CollectAll)
      .add(new MinLengthValidator(10))
      .add(new RegexValidator(/^[A-Z]/, 'Must start with uppercase'));
    const result = pipeline.validate('abc');
    expect(result.isValid).toBe(false);
    if (result.kind === 'invalid') {
      const joined = result.messages.join(' ');
      expect(joined).toContain('at least 10');
      expect(joined).toContain('uppercase');
    }
  });
});
