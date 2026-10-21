import { isSeededMockData } from "./mock-store";
import type { MajaaApi } from "./mock-api";
import { mockApi } from "./mock-api";

/** Typed API client — seeded demo data only when VITE_USE_MOCK_API is not false. */
export const api: MajaaApi = mockApi;

/** True when Snap Studio seed data is active (development demos). */
export const isMockApi = isSeededMockData();
export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
