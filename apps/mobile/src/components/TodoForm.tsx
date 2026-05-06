import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import {
  TextInput,
  Button,
  HelperText,
  Chip,
  Text,
  Menu,
  IconButton,
} from "react-native-paper";
import { useCategories } from "../hooks/useCategories";
import { useTags } from "../hooks/useTags";
import { useAllTodos } from "../hooks/useTodos";
import type { TodoCreate, CategoryResponse, TagResponse, TodoResponse } from "@todo-app/shared";

const PRIORITIES = [
  { value: "LOW", label: "Low", color: "#4caf50" },
  { value: "MEDIUM", label: "Medium", color: "#ff9800" },
  { value: "HIGH", label: "High", color: "#f44336" },
  { value: "URGENT", label: "Urgent", color: "#9c27b0" },
] as const;

interface TodoFormProps {
  onSubmit: (data: TodoCreate) => Promise<void>;
  isLoading?: boolean;
  initialValues?: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    categoryId?: string;
    tags?: string[];
    parentId?: string;
  };
  /** Exclude this todo id from the parent selector (e.g. when editing) */
  excludeTodoId?: string;
}

export function TodoForm({
  onSubmit,
  isLoading = false,
  initialValues,
  excludeTodoId,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [priority, setPriority] = useState<string | undefined>(
    initialValues?.priority
  );
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || "");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initialValues?.categoryId
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tags || []
  );
  const [parentId, setParentId] = useState<string | undefined>(
    initialValues?.parentId
  );
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [parentMenuVisible, setParentMenuVisible] = useState(false);

  const { categoriesQuery } = useCategories();
  const { tagsQuery } = useTags();
  const allTodosQuery = useAllTodos();

  const categories = categoriesQuery.data || [];
  const availableTags = tagsQuery.data || [];
  const allTodos = (allTodosQuery.data || []).filter(
    (t: TodoResponse) => t.id !== excludeTodoId
  );

  const selectedCategory = categories.find(
    (c: CategoryResponse) => c.id === categoryId
  );
  const selectedParent = allTodos.find(
    (t: TodoResponse) => t.id === parentId
  );

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setDescription(initialValues.description || "");
      setPriority(initialValues.priority);
      setDueDate(initialValues.dueDate || "");
      setCategoryId(initialValues.categoryId);
      setSelectedTags(initialValues.tags || []);
      setParentId(initialValues.parentId);
    }
  }, [
    initialValues?.title,
    initialValues?.description,
    initialValues?.priority,
    initialValues?.dueDate,
    initialValues?.categoryId,
    initialValues?.parentId,
  ]);

  const handleTogglePriority = useCallback(
    (value: string) => {
      setPriority((prev) => (prev === value ? undefined : value));
    },
    []
  );

  const handleAddTag = useCallback(
    (tagName: string) => {
      const normalized = tagName.trim().toLowerCase();
      if (normalized && !selectedTags.includes(normalized)) {
        setSelectedTags((prev) => [...prev, normalized]);
      }
      setNewTag("");
    },
    [selectedTags]
  );

  const handleRemoveTag = useCallback((tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (dueDate && !/^\d{4}-\d{2}-\d{2}/.test(dueDate)) {
      setError("Due date must be in YYYY-MM-DD format");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: (priority as TodoCreate["priority"]) || undefined,
        dueDate: dueDate.trim() || undefined,
        categoryId: categoryId || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        parentId: parentId || undefined,
      });

      // Clear form on success (only if no initial values, i.e., create mode)
      if (!initialValues) {
        setTitle("");
        setDescription("");
        setPriority(undefined);
        setDueDate("");
        setCategoryId(undefined);
        setSelectedTags([]);
        setParentId(undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Title"
        placeholder="Title"
        value={title}
        onChangeText={(text: string) => {
          setTitle(text);
          if (error) setError(null);
        }}
        mode="outlined"
        error={!!error}
        disabled={isLoading}
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <TextInput
        label="Description"
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        disabled={isLoading}
        style={styles.descriptionInput}
      />

      {/* Priority picker */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Priority
      </Text>
      <View style={styles.chipRow}>
        {PRIORITIES.map((p) => (
          <Chip
            key={p.value}
            selected={priority === p.value}
            onPress={() => handleTogglePriority(p.value)}
            style={[
              styles.priorityChip,
              priority === p.value && { backgroundColor: p.color + "20" },
            ]}
            selectedColor={priority === p.value ? p.color : undefined}
            disabled={isLoading}
          >
            {p.label}
          </Chip>
        ))}
      </View>

      {/* Due date */}
      <TextInput
        label="Due Date"
        placeholder="YYYY-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
        mode="outlined"
        disabled={isLoading}
        style={styles.fieldInput}
        left={<TextInput.Icon icon="calendar" />}
      />

      {/* Category selector */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Category
      </Text>
      <Menu
        visible={categoryMenuVisible}
        onDismiss={() => setCategoryMenuVisible(false)}
        anchor={
          <Pressable onPress={() => setCategoryMenuVisible(true)}>
            <TextInput
              label="Category"
              value={selectedCategory?.name || ""}
              placeholder="Select a category (optional)"
              mode="outlined"
              editable={false}
              disabled={isLoading}
              right={
                categoryId ? (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => setCategoryId(undefined)}
                  />
                ) : (
                  <TextInput.Icon icon="menu-down" />
                )
              }
              pointerEvents="none"
            />
          </Pressable>
        }
        style={styles.categoryMenu}
      >
        {categories.length === 0 ? (
          <Menu.Item title="No categories available" disabled />
        ) : (
          categories.map((cat: CategoryResponse) => (
            <Menu.Item
              key={cat.id}
              title={cat.name}
              leadingIcon={cat.icon || undefined}
              onPress={() => {
                setCategoryId(cat.id);
                setCategoryMenuVisible(false);
              }}
              trailingIcon={
                cat.color ? undefined : undefined
              }
            />
          ))
        )}
      </Menu>

      {/* Parent todo selector */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Parent Todo
      </Text>
      <Menu
        visible={parentMenuVisible}
        onDismiss={() => setParentMenuVisible(false)}
        anchor={
          <Pressable onPress={() => setParentMenuVisible(true)}>
            <TextInput
              label="Parent Todo"
              value={selectedParent?.title || ""}
              placeholder="Select a parent todo (optional)"
              mode="outlined"
              editable={false}
              disabled={isLoading}
              right={
                parentId ? (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => setParentId(undefined)}
                  />
                ) : (
                  <TextInput.Icon icon="menu-down" />
                )
              }
              pointerEvents="none"
            />
          </Pressable>
        }
        style={styles.categoryMenu}
      >
        {allTodos.length === 0 ? (
          <Menu.Item title="No todos available" disabled />
        ) : (
          allTodos.map((t: TodoResponse) => (
            <Menu.Item
              key={t.id}
              title={t.title}
              onPress={() => {
                setParentId(t.id);
                setParentMenuVisible(false);
              }}
            />
          ))
        )}
      </Menu>

      {/* Tags input */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Tags
      </Text>
      <View style={styles.tagsContainer}>
        <View style={styles.tagChipsRow}>
          {selectedTags.map((tag) => (
            <Chip
              key={tag}
              onClose={() => handleRemoveTag(tag)}
              style={styles.tagChip}
              disabled={isLoading}
            >
              {tag}
            </Chip>
          ))}
        </View>
        <View style={styles.tagInputRow}>
          <TextInput
            placeholder="Add a tag"
            value={newTag}
            onChangeText={setNewTag}
            mode="outlined"
            dense
            disabled={isLoading}
            style={styles.tagInput}
            onSubmitEditing={() => handleAddTag(newTag)}
            returnKeyType="done"
          />
          <IconButton
            icon="plus"
            mode="contained"
            onPress={() => handleAddTag(newTag)}
            disabled={isLoading || !newTag.trim()}
            size={20}
          />
        </View>
        {/* Show available tags not yet selected */}
        {availableTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.availableTagsRow}
          >
            {availableTags
              .filter((t: TagResponse) => !selectedTags.includes(t.name))
              .map((tag: TagResponse) => (
                <Chip
                  key={tag.id}
                  onPress={() => handleAddTag(tag.name)}
                  style={styles.availableTagChip}
                  disabled={isLoading}
                >
                  {tag.name}
                </Chip>
              ))}
          </ScrollView>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      >
        {isLoading
          ? "Creating..."
          : initialValues
            ? "Update"
            : "Create"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  descriptionInput: {
    marginTop: 8,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityChip: {
    marginRight: 0,
  },
  fieldInput: {
    marginTop: 8,
  },
  categoryMenu: {
    width: "100%",
  },
  tagsContainer: {
    gap: 8,
  },
  tagChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    marginRight: 0,
  },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagInput: {
    flex: 1,
  },
  availableTagsRow: {
    marginTop: 4,
  },
  availableTagChip: {
    marginRight: 6,
  },
  submitButton: {
    marginTop: 16,
  },
});
