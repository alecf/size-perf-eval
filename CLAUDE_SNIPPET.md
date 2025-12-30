# Bundle Size Optimization Guidelines

Copy this section to your CLAUDE.md for size-critical projects (ESP32, embedded web, etc.)

---

## Bundle Size Optimization Rules

When writing TypeScript/React code for this project, prioritize minimal bundle size:

### TypeScript Patterns

- **NEVER use regular enums** - they add ~100 bytes of runtime code. Use string union types instead:
  ```typescript
  // GOOD: Type-only, erased at compile time
  type Status = "pending" | "active" | "done";

  // BAD: Creates runtime object
  enum Status { Pending, Active, Done }
  ```

- **Use `const enum`** only if building with SWC (Next.js). Vite/Rollup doesn't inline them.

- **Always use `import type`** for type-only imports:
  ```typescript
  import type { FC, ReactNode } from 'react';
  ```

### Array Operations

- **Prefer array methods over manual loops** - they minify ~14% smaller:
  ```typescript
  // GOOD: Smaller bundle
  const doubled = items.map(x => x * 2);
  const sum = items.reduce((a, b) => a + b, 0);

  // AVOID: Larger bundle
  for (let i = 0; i < items.length; i++) { ... }
  ```

### Functions

- **Prefer arrow functions** for callbacks and small utilities:
  ```typescript
  // GOOD: Shortest
  const add = (a: number, b: number) => a + b;

  // AVOID: Named function expressions
  const add = function add(a, b) { return a + b; };
  ```

### JSX

- **Wrapper `<div>` is smaller than fragments** (by ~8 bytes gzipped). Use fragments only when avoiding extra DOM nodes matters.

### Async

- **Use `Promise.all`** for parallel operations:
  ```typescript
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  ```

### Module Exports

- **For library code**: Use named exports (better tree-shaking)
- **For app code**: Either pattern is fine
- **Avoid mixing** default + named exports in the same file

### General

- Avoid utility libraries (lodash, etc.) for simple operations - use native APIs
- Use dynamic imports for code splitting large optional features
- Target ES2023+ to avoid polyfills
