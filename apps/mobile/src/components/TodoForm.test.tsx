import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TodoForm } from "./TodoForm";

describe("TodoForm", () => {
  it("should render title and description inputs", () => {
    const { getByPlaceholderText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByPlaceholderText("Title")).toBeTruthy();
    expect(getByPlaceholderText("Description (optional)")).toBeTruthy();
  });

  it("should show submit button", () => {
    const { getByText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByText("Create")).toBeTruthy();
  });

  it("should show validation error when title is empty", async () => {
    const onSubmit = jest.fn();
    const { getByText, getByTestId } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should call onSubmit with form data when valid", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");
    fireEvent.changeText(
      getByPlaceholderText("Description (optional)"),
      "New Description"
    );
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "New Todo",
        description: "New Description",
        priority: undefined,
        dueDate: undefined,
        categoryId: undefined,
        tags: undefined,
      });
    });
  });

  it("should call onSubmit without description when empty", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "New Todo",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
        categoryId: undefined,
        tags: undefined,
      });
    });
  });

  it("should clear form after successful submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    const titleInput = getByPlaceholderText("Title");
    fireEvent.changeText(titleInput, "New Todo");
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(titleInput.props.value).toBe("");
    });
  });

  it("should show loading state during submission", async () => {
    const onSubmit = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} isLoading={true} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");

    expect(getByText("Creating...")).toBeTruthy();
  });

  it("should accept initial values", () => {
    const { getByPlaceholderText } = render(
      <TodoForm
        onSubmit={jest.fn()}
        initialValues={{ title: "Initial Title", description: "Initial Desc" }}
      />
    );

    expect(getByPlaceholderText("Title").props.value).toBe("Initial Title");
    expect(
      getByPlaceholderText("Description (optional)").props.value
    ).toBe("Initial Desc");
  });
});
