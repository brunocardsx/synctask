import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock do scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock do window.confirm
Object.defineProperty(window, "confirm", {
  value: vi.fn(),
  writable: true,
});

// Mock do window.alert
Object.defineProperty(window, "alert", {
  value: vi.fn(),
  writable: true,
});

// Mock do window.history.back
Object.defineProperty(window.history, "back", {
  value: vi.fn(),
  writable: true,
});

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock do apiClient
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock do socket
vi.mock("../hooks/useSocket", () => ({
  useSocket: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  }),
}));

// Configurar valores padrão para localStorage
mockLocalStorage.getItem.mockImplementation((key: string) => {
  const mockData: Record<string, string> = {
    authToken: "mock-token",
    userEmail: "test@example.com",
    userName: "Test User",
    userId: "user-123",
  };
  return mockData[key] || null;
});
