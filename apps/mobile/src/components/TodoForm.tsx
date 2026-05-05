import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import type { TodoCreate } from "@todo-app/shared";

interface TodoFormProps {
  onSubmit: (data: TodoCreate) => Promise<void>;
  isLoading?: boolean;
  initialValues?: { title: string; description?: string };
}

export function TodoForm({
  onSubmit,
  isLoading = false,
  initialValues,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setDescription(initialValues.description || "");
    }
  }, [initialValues?.title, initialValues?.description]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Clear form on success (only if no initial values, i.e., create mode)
      if (!initialValues) {
        setTitle("");
        setDescription("");
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
  submitButton: {
    marginTop: 16,
  },
});
