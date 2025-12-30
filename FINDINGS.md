# Bundle Size Optimization Findings

Results from systematic experiments comparing TypeScript/React code patterns for minimal gzipped bundle size.

**Test Environment:**
- Vite 6.0 with Rollup (esbuild minifier by default)
- SWC (same toolchain as Next.js)
- Target: ES2023
- React externalized (measuring code delta only)

## Key Findings Summary

| Category | Best Pattern | Worst Pattern | Savings |
|----------|--------------|---------------|---------|
| TypeScript Enums | string-union / const-enum | regular enum | ~25% smaller |
| Array Iteration | `.map()` | `for (i=0...)` | ~14% smaller |
| Functions | Arrow functions | Named expressions | ~7% smaller |
| Async | Promise.all + await | Sequential async/await | ~3% smaller |
| JSX Fragments | `<div>` wrapper | `<Fragment>` | ~4% smaller |
| Module Exports | Default export object | Named exports | ~27% smaller |

---

## Detailed Results

### 1. TypeScript: Enums vs Alternatives

| Pattern | Vite (gzipped) | SWC (gzipped) | Notes |
|---------|----------------|---------------|-------|
| `string-union` | 439 B | **349 B** | Best - types erased at runtime |
| `const enum` | 469 B | **349 B** | SWC inlines, Vite doesn't |
| `enum` | 469 B | 461 B | Adds runtime object |
| `const object` | 529 B | 357 B | Object remains in bundle |

**Recommendation:** Use string union types (`type Status = "a" | "b"`) or const enums with SWC. Avoid regular enums - they add ~100 bytes of runtime code.

```typescript
// BEST: String union (type-only, erased)
type Status = "pending" | "active" | "done";

// GOOD with SWC: Const enum (inlined, same size as string union)
const enum Priority { Low = 1, High = 2 }

// OKAY: Regular enum (adds ~230 bytes runtime object)
enum Status { Pending, Active, Done }

// AVOID: Const object (larger bundle AND 4-5x slower!)
const Status = { Pending: "pending", Active: "active" } as const;
```

### Performance Note

Runtime performance testing (10M iterations) shows:
- **enum, const enum, string literals**: ~6ms (identical - V8 optimizes them)
- **const object (`as const`)**: ~28ms (**4-5x slower** due to property lookups)

The popular `as const` pattern is both larger AND significantly slower than alternatives!

---

### 2. Array Iteration Methods

| Pattern | Vite (gzipped) | SWC (gzipped) | Notes |
|---------|----------------|---------------|-------|
| `.map()` | **419 B** | **325 B** | Best - functional, concise |
| `.reduce()` | 431 B | 331 B | Good for accumulation |
| `.forEach()` | 440 B | 347 B | Slightly larger |
| `for...of` | 437 B | 351 B | ES6 iteration |
| `for (i=0...)` | 470 B | 379 B | Largest - verbose |

**Recommendation:** Use `.map()`, `.filter()`, `.reduce()` over manual loops. They minify better and are more readable.

```typescript
// BEST: Array methods
const doubled = items.map(x => x * 2);
const sum = items.reduce((a, b) => a + b, 0);
const filtered = items.filter(x => x > 5);

// AVOID: Traditional for loops
const doubled = [];
for (let i = 0; i < items.length; i++) {
  doubled.push(items[i] * 2);
}
```

---

### 3. Function Syntax

| Pattern | Vite (gzipped) | SWC (gzipped) | Notes |
|---------|----------------|---------------|-------|
| Arrow functions | **452 B** | **336 B** | Best - shortest syntax |
| Function declarations | 475 B | 352 B | Slightly larger |
| Function expressions | 481 B | 362 B | Largest - named expressions |

**Recommendation:** Prefer arrow functions for callbacks and small utilities. Function declarations are fine for top-level functions.

```typescript
// BEST: Arrow functions (especially for callbacks)
const add = (a: number, b: number) => a + b;
items.map(x => x * 2);

// OKAY: Function declarations for named top-level
function processData(data: Item[]) { ... }

// AVOID: Named function expressions
const add = function add(a: number, b: number) { return a + b; };
```

---

### 4. Async Patterns

| Pattern | Vite (gzipped) | SWC (gzipped) | Notes |
|---------|----------------|---------------|-------|
| Promise.all + await | **520 B** | **434 B** | Best for parallel |
| Promise.then chains | 523 B | 442 B | Slightly larger |
| Sequential async/await | 532 B | 446 B | Largest |

**Note:** Differences are small (< 3%). Choose based on readability and parallelism needs.

**Recommendation:** Use `Promise.all` for parallel operations. async/await is fine for sequential code - the size difference is minimal.

```typescript
// BEST: Promise.all for parallel operations
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id)
]);

// OKAY: async/await for sequential
const user = await fetchUser(id);
const posts = await fetchPosts(user.id);
```

---

### 5. JSX Fragments

| Pattern | Vite (gzipped) | SWC (gzipped) | Notes |
|---------|----------------|---------------|-------|
| `<div>` wrapper | **305 B** | **248 B** | Smallest! |
| `<></>` shorthand | 314 B | 256 B | Fragment import |
| `<Fragment>` | 318 B | 259 B | Explicit import |

**Surprise finding:** Wrapper `<div>` is actually smaller than fragments because it's just a string, while fragments require the jsx-runtime Fragment symbol.

**Recommendation:** If you need a wrapper element anyway, `<div>` is fine. Use fragments only when you specifically need to avoid an extra DOM node.

---

### 6. Module Export Patterns

| Pattern | Vite (gzipped) | SWC (gzipped) | Notes |
|---------|----------------|---------------|-------|
| Default export object | **419 B** | **265 B** | Smallest when not tree-shaking |
| Named exports | 477 B | 363 B | Better for tree-shaking |
| Mixed exports | 481 B | 370 B | Largest |

**Recommendation:**
- For **library code** that will be tree-shaken: Use named exports
- For **app code** where entire module is used: Default export or named exports are similar
- Avoid mixing default + named exports in the same file

---

## Build Tool Comparison

### Vite (Rollup + esbuild) vs SWC

| Aspect | Vite | SWC |
|--------|------|-----|
| Const enum handling | Not inlined | Fully inlined |
| Overall bundle size | Larger | ~15-25% smaller |
| Terser vs esbuild | Terser often larger for small files | N/A |
| Build speed | Fast | Faster |

**Key insight:** SWC produces consistently smaller bundles. If using Next.js or SWC directly, you benefit from better const enum inlining and tighter minification.

---

## Additional Recommendations

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}
```

- **ES2023 target**: Avoids polyfills for modern features
- **verbatimModuleSyntax**: Ensures `import type` is respected
- **isolatedModules**: Required for SWC/esbuild compatibility

### Other Size Optimizations

1. **Use `import type`** for type-only imports:
   ```typescript
   import type { FC } from 'react';  // Erased at compile time
   ```

2. **Avoid namespace imports** when you only need a few items:
   ```typescript
   // GOOD
   import { useState, useEffect } from 'react';

   // AVOID (prevents tree-shaking)
   import * as React from 'react';
   ```

3. **Prefer native APIs** over utility libraries for simple operations:
   ```typescript
   // Use native
   Object.keys(obj).length === 0

   // Avoid lodash for simple checks
   _.isEmpty(obj)
   ```

4. **Dynamic imports** for code splitting:
   ```typescript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

---

## Raw Data

Full experiment results are in `results/reports/summary.json`.

To run experiments:
```bash
npm run experiment:all -- --verbose
```

To run a specific category:
```bash
npm run experiment:category -- --category=loops
```
