import cloneDeep from "lodash.clonedeep";
import { toRaw } from "vue";
import clearObject from "./clearObject";

export interface StateManagementOptions {
  replace?: boolean;
}

export const clearState = (target: unknown): void => {
  if (Array.isArray(target)) {
    (target as unknown[]).length = 0;
    return;
  }

  clearObject(target as Record<string, unknown>);
};

export const assignClonedState = (target: unknown, source: unknown): void => {
  if (source == null || typeof source !== "object") {
    return;
  }

  const prepared = cloneDeep(toRaw(source));

  if (Array.isArray(target) && Array.isArray(prepared)) {
    (target as unknown[]).push(...(prepared as unknown[]));
    return;
  }

  Object.assign(target as Record<string, unknown>, prepared as Record<string, unknown>);
};

export const applyState = (
  target: unknown,
  source: unknown,
  options: StateManagementOptions = {},
): void => {
  if (options.replace) {
    clearState(target);
  }

  if (source == null) {
    return;
  }

  assignClonedState(target, source);
};
