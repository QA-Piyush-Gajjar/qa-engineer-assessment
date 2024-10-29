import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom/extend-expect";
 
// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
 
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});
 
// Test suite for the App component
describe("Todo App", () => {
  beforeEach(() => {
    localStorage.clear();
  });
 
  test("Confirm that the todo list is accurately loaded from local storage upon application start.", () => {
    render(<App />);
 
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    expect(savedTodos).toHaveLength(3);
    expect(savedTodos[0].label).toBe("Buy groceries");
    expect(savedTodos[1].label).toBe("Reboot computer");
    expect(savedTodos[2].label).toBe("Ace CoderPad interview");
  });
 
  test("Verify that clicking a todo item changes its checked state.", () => {
    render(<App />);
 
    const todoCheckbox = screen.getByLabelText("Buy groceries");
    expect(todoCheckbox).not.toBeChecked();
    fireEvent.click(todoCheckbox);
    expect(todoCheckbox).toBeChecked();
  });
 
  test("Ensure that the todo list is correctly saved to local storage.", () => {
    render(<App />);
 
    const input = screen.getByPlaceholderText("Add a new todo item here");
    fireEvent.change(input, { target: { value: "Persisted todo" } });
    fireEvent.submit(input);
 
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    expect(savedTodos).toHaveLength(4); // Initially 3 todos + 1 added
    expect(savedTodos[0].label).toBe("Persisted todo"); // Check that the new todo is added
  });
 
  test("Test that checked items automatically move to the bottom of the list.", () => {
    render(<App />);
 
    const rebootCheckbox = screen.getByLabelText("Reboot computer");
    fireEvent.click(rebootCheckbox); // Toggle checked state
 
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
 
    // Ensure the todo is marked as checked in localStorage
    expect(
      savedTodos.find((todo) => todo.label === "Reboot computer")?.checked
    ).toBe(true);
 
    // Verify that all todos are visible
    expect(screen.getByText("Buy groceries")).toBeVisible();
    expect(screen.getByText("Reboot computer")).toBeVisible();
    expect(screen.getByText("Ace CoderPad interview")).toBeVisible();
  });
});
