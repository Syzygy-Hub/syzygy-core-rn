// Feature Flags
// Evaluation rules, flag definitions, local overrides, and A/B variant selection.

export interface FeatureFlag<T> {
  key: string;
  defaultValue: T;
}

export class FeatureFlagProvider {
  // TODO: evaluation rules, override storage, A/B variant selection
}
