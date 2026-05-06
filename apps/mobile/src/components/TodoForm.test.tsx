import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { TodoForm } from "./TodoForm";
import { useCategories } from "../hooks/useCategories";
import { useTags } from "../hooks/useTags";
import { useAllTodos } from "../hooks/useTodos";

jest.mock("../hooks/useCategories");
jest.mock("../hooks/useTags");
jest.mock("../hooks/useTodos");

const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>;
const mockUseTags = useTags as jest.MockedFunction<typeof useTags>;
const mockUseAllTodos = useAllTodos as jest.MockedFunction<typeof useAllTodos>;

const baseTodo = {
  id: "1",
  title: "Existing Todo",
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

function setupMocks(overrides?: {
  categories?: any[];
  tags?: any[];
  allTodos?: any[];
}) {
  const categories = overrides?.categories || [];
  const tags = overrides?.tags || [];
  const allTodos = overrides?.allTodos || [];

  mockUseCategories.mockReturnValue({
    categoriesQuery: { data: categories } as any,
    createCategory: {} as any,
    deleteCategory: {} as any,
  });

  mockUseTags.mockReturnValue({
    tagsQuery: { data: tags } as any,
    createTag: {} as any,
    deleteTag: {} as any,
  });

  mockUseAllTodos.mockReturnValue({ data: allTodos } as any);
}

describe("TodoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it("should render title and description inputs", () => {
    const { getByPlaceholderText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByPlaceholderText("Title")).toBeTruthy();
    expect(getByPlaceholderText("Description (optional)")).toBeTruthy();
  });

  it("should render priority chips", () => {
    const { getByText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByText("Low")).toBeTruthy();
    expect(getByText("Medium")).toBeTruthy();
    expect(getByText("High")).toBeTruthy();
    expect(getByText("Urgent")).toBeTruthy();
  });

  it("should render due date input", () => {
    const { getByPlaceholderText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByPlaceholderText("YYYY-MM-DD")).toBeTruthy();
  });

  it("should render category selector", () => {
    const { getAllByText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getAllByText("Category").length).toBeGreaterThan(0);
  });

  it("should render tags section", () => {
    const { getByText, getByPlaceholderText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByText("Tags")).toBeTruthy();
    expect(getByPlaceholderText("Add a tag")).toBeTruthy();
  });

  it("should show submit button as Create", () => {
    const { getByText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByText("Create")).toBeTruthy();
  });

  it("should show Update button when initialValues are provided", () => {
    const { getByText } = render(
      <TodoForm
        onSubmit={jest.fn()}
        initialValues={{
          title: "Existing Title",
          description: "Existing Description",
          priority: "HIGH",
          dueDate: "2024-12-31",
          categoryId: "cat-1",
          tags: ["work"],
          parentId: "parent-1",
        }}
      />
    );

    expect(getByText("Update")).toBeTruthy();
  });

  it("should show validation error when title is empty", async () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(getByText("Title is required")).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should not show error for valid due date", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText, queryByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");
    fireEvent.changeText(getByPlaceholderText("YYYY-MM-DD"), "2024-12-31");
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
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
        parentId: undefined,
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
        parentId: undefined,
      });
    });
  });

  it("should select and deselect a priority", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");

    // Select priority and submit
    fireEvent.press(getByText("High"));
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: "HIGH" })
      );
    });

    // Wait for form state to flush after submission
    await act(async () => {});

    // Re-enter title (form was cleared after submission)
    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");

    // Deselect: press High once to set priority (undefined -> HIGH),
    // then press High again to deselect (HIGH -> undefined)
    onSubmit.mockClear();
    fireEvent.press(getByText("High"));
    fireEvent.press(getByText("High"));
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: undefined })
      );
    });
  });

  it("should add a tag and include it in submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");
    fireEvent.changeText(getByPlaceholderText("Add a tag"), "work");
    fireEvent.press(getByText("plus"));

    expect(getByText("work")).toBeTruthy();

    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ["work"] })
      );
    });
  });

  it("should remove a tag when close button is pressed", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText, getAllByTestId } = render(
      <TodoForm
        onSubmit={onSubmit}
        initialValues={{ title: "Test", tags: ["work"] }}
      />
    );

    const closeButtons = getAllByTestId("chip-close");
    fireEvent.press(closeButtons[0]);

    fireEvent.press(getByText("Update"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ tags: undefined })
      );
    });
  });

  it("should set due date in submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");
    fireEvent.changeText(getByPlaceholderText("YYYY-MM-DD"), "2024-12-31");
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ dueDate: "2024-12-31" })
      );
    });
  });

  it("should accept initial values", () => {
    const { getByPlaceholderText } = render(
      <TodoForm
        onSubmit={jest.fn()}
        initialValues={{
          title: "Initial Title",
          description: "Initial Desc",
          priority: "MEDIUM",
          dueDate: "2024-12-31",
          categoryId: "cat-1",
          tags: ["work"],
          parentId: "parent-1",
        }}
      />
    );

    expect(getByPlaceholderText("Title").props.value).toBe("Initial Title");
    expect(
      getByPlaceholderText("Description (optional)").props.value
    ).toBe("Initial Desc");
    expect(getByPlaceholderText("YYYY-MM-DD").props.value).toBe("2024-12-31");
  });

  it("should show categories in the dropdown", async () => {
    setupMocks({
      categories: [
        { id: "cat-1", name: "Work", color: "#ff0000", icon: null },
        { id: "cat-2", name: "Personal", color: "#00ff00", icon: null },
      ],
    });

    const { getByText, getByPlaceholderText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    // Press the category selector anchor (the Pressable wrapping the TextInput)
    const categoryInput = getByPlaceholderText("Select a category (optional)");
    fireEvent.press(categoryInput);

    await waitFor(() => {
      expect(getByText("Work")).toBeTruthy();
      expect(getByText("Personal")).toBeTruthy();
    });
  });

  it("should show available tags for selection", async () => {
    setupMocks({
      tags: [
        { id: "tag-1", name: "work" },
        { id: "tag-2", name: "personal" },
      ],
    });

    const { getByText } = render(
      <TodoForm onSubmit={jest.fn()} />
    );

    expect(getByText("work")).toBeTruthy();
    expect(getByText("personal")).toBeTruthy();
  });

  it("should submit with all fields populated", async () => {
    setupMocks({
      categories: [{ id: "cat-1", name: "Work", color: "#ff0000", icon: null }],
      allTodos: [baseTodo],
    });

    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "Full Todo");
    fireEvent.changeText(getByPlaceholderText("Description (optional)"), "Full Description");
    fireEvent.press(getByText("High"));
    fireEvent.changeText(getByPlaceholderText("YYYY-MM-DD"), "2024-12-31");
    fireEvent.changeText(getByPlaceholderText("Add a tag"), "urgent");
    fireEvent.press(getByText("plus"));

    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Full Todo",
        description: "Full Description",
        priority: "HIGH",
        dueDate: "2024-12-31",
        categoryId: undefined,
        tags: ["urgent"],
        parentId: undefined,
      });
    });
  });

  it("should clear form after successful create submission", async () => {
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

  it("should not clear form after successful update submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <TodoForm
        onSubmit={onSubmit}
        initialValues={{ title: "Initial Title" }}
      />
    );

    fireEvent.press(getByText("Update"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(getByPlaceholderText("Title").props.value).toBe("Initial Title");
  });

  it("should display error message on submission failure", async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error("Network error"));
    const { getByPlaceholderText, getByText } = render(
      <TodoForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "New Todo");
    fireEvent.press(getByText("Create"));

    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });
  });
});
