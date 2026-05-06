import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Alert } from "react-native";
import {
  FAB,
  Card,
  Text,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Button,
  Chip,
  useTheme,
} from "react-native-paper";
import { useCategories } from "../../src/hooks/useCategories";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { EmptyState } from "../../src/components/EmptyState";
import type { CategoryResponse, CategoryCreate } from "@todo-app/shared";

const PRESET_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#607d8b",
];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { categoriesQuery, createCategory, deleteCategory } = useCategories();

  const categories = categoriesQuery.data || [];
  const isRefreshing = categoriesQuery.isFetching && !categoriesQuery.isLoading;

  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  const [nameError, setNameError] = useState(false);

  const handleRefresh = useCallback(() => {
    categoriesQuery.refetch();
  }, [categoriesQuery]);

  const openDialog = useCallback(() => {
    setName("");
    setColor("");
    setIcon("");
    setNameError(false);
    setDialogVisible(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogVisible(false);
  }, []);

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    const input: CategoryCreate = {
      name: name.trim(),
      color: color || undefined,
      icon: icon || undefined,
    };

    createCategory.mutate(input, {
      onSuccess: () => {
        setDialogVisible(false);
      },
    });
  }, [name, color, icon, createCategory]);

  const handleDelete = useCallback(
    (category: CategoryResponse) => {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${category.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteCategory.mutate(category.id),
          },
        ]
      );
    },
    [deleteCategory]
  );

  const renderCategory = useCallback(
    ({ item }: { item: CategoryResponse }) => (
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title={item.name}
          left={() => (
            <View
              style={[
                styles.colorDot,
                { backgroundColor: item.color || colors.primary },
              ]}
            />
          )}
          right={() => (
            <IconButton
              icon="delete-outline"
              iconColor={colors.error}
              onPress={() => handleDelete(item)}
              testID={`delete-category-${item.id}`}
            />
          )}
        />
        {item.icon && (
          <Card.Content>
            <Chip
              icon={item.icon}
              style={styles.iconChip}
              compact
            >
              {item.icon}
            </Chip>
          </Card.Content>
        )}
      </Card>
    ),
    [colors.primary, colors.error, handleDelete]
  );

  if (categoriesQuery.isLoading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to organize your todos!"
          actionLabel="Create Category"
          onAction={openDialog}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openDialog}
        testID="create-category-fab"
        label="New Category"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>New Category</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) setNameError(false);
              }}
              mode="outlined"
              error={nameError}
              style={styles.dialogInput}
              testID="category-name-input"
            />
            {nameError && (
              <Text variant="bodySmall" style={{ color: colors.error, marginBottom: 8 }}>
                Name is required
              </Text>
            )}

            <Text variant="bodySmall" style={styles.fieldLabel}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((preset) => (
                <Chip
                  key={preset}
                  selected={color === preset}
                  onPress={() => setColor(color === preset ? "" : preset)}
                  style={[
                    styles.colorChip,
                    color === preset && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  compact
                >
                  <View
                    style={[styles.colorDotSmall, { backgroundColor: preset }]}
                  />
                </Chip>
              ))}
            </View>

            <TextInput
              label="Icon (MaterialCommunityIcons name, optional)"
              value={icon}
              onChangeText={setIcon}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="e.g. tag, folder, star"
              testID="category-icon-input"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              onPress={handleCreate}
              loading={createCategory.isPending}
              disabled={createCategory.isPending}
              testID="create-category-submit"
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 16,
  },
  iconChip: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  dialogInput: {
    marginBottom: 8,
  },
  fieldLabel: {
    marginBottom: 8,
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 4,
  },
  colorChip: {
    marginBottom: 4,
  },
  colorDotSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
