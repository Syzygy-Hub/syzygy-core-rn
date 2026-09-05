import { ValidationPipeline } from '../../validation/Validator';

describe('Validation', () => {
  it('should return valid for empty pipeline', () => {
    const pipeline = new ValidationPipeline<string>([]);
    expect(pipeline.validate('test').valid).toBe(true);
  });
});
