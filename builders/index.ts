export { BaseBuilder } from "./base-builder.js";
export { ViteBuilder } from "./vite-builder.js";
export { SwcBuilder } from "./swc-builder.js";

import { ViteBuilder } from "./vite-builder.js";
import { SwcBuilder } from "./swc-builder.js";
import type { BaseBuilder } from "./base-builder.js";

/**
 * Get all available builders.
 */
export function getAllBuilders(): BaseBuilder[] {
  return [new ViteBuilder(), new SwcBuilder()];
}

/**
 * Get a builder by name.
 */
export function getBuilder(name: string): BaseBuilder | undefined {
  const builders = getAllBuilders();
  return builders.find((b) => b.name === name);
}
