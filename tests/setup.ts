import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount rendered components and start every test with empty browser storage.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
