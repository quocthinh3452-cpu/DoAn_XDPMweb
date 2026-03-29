import { clsx } from "clsx";

/**
 * cn() — class name builder
 * Accepts strings, arrays, objects (falsy values ignored).
 *
 * Usage:
 *   cn("base", isActive && "active", { "hidden": !visible })
 *   cn(["a", "b"], condition ? "x" : "y")
 */
export function cn(...inputs) {
  return clsx(inputs);
}
