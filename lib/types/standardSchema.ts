/**
 * Minimal vendored copy of the Standard Schema v1 interface (https://standardschema.dev).
 * Implemented by Zod, Valibot, ArkType and others via the `~standard` property, so a single
 * adapter can validate against any of them. We vendor the interface to avoid a runtime/peer
 * dependency on `@standard-schema/spec`.
 */
export interface StandardSchemaPathSegment {
  readonly key: PropertyKey;
}

export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | StandardSchemaPathSegment> | undefined;
}

export interface StandardSchemaSuccessResult<Output> {
  readonly value: Output;
  readonly issues?: undefined;
}

export interface StandardSchemaFailureResult {
  readonly issues: ReadonlyArray<StandardSchemaIssue>;
}

export type StandardSchemaResult<Output> =
  | StandardSchemaSuccessResult<Output>
  | StandardSchemaFailureResult;

export interface StandardSchemaProps<Input, Output> {
  readonly version: 1;
  readonly vendor: string;
  readonly validate: (
    value: unknown,
  ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
  readonly types?: { readonly input: Input; readonly output: Output } | undefined;
}

export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": StandardSchemaProps<Input, Output>;
}
