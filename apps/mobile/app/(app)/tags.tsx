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
import { useTags } from "../../src/hooks/useTags";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { EmptyState } from "../../src/components/EmptyState";
import type { TagResponse } from "@todo-app/shared";

export default function TagsScreen() {
  const { colors } = useTheme();
  const { tagsQuery, createTag, deleteTag } = useTags();

  const tags = tagsQuery.data || [];
  const isRefreshing = tagsQuery.isFetching && !tagsQuery.isLoading;

  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);

  const handleRefresh = useCallback(() => {
    tagsQuery.refetch();
  }, [tagsQuery]);

  const openDialog = useCallback(() => {
    setName("");
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

    createTag.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setDialogVisible(false);
        },
      }
    );
  }, [name, createTag]);

  const handleDelete = useCallback(
    (tag: TagResponse) => {
      Alert.alert(
        "Delete Tag",
        `Are you sure you want to delete "${tag.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteTag.mutate(tag.id),
          },
        ]
      );
    },
    [deleteTag]
  );

  const renderTag = useCallback(
    ({ item }: { item: TagResponse }) => (
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title={item.name}
          left={() => (
            <Chip
              icon="tag"
              style={styles.tagChip}
              compact
            >
              {item.name}
            </Chip>
          )}
          right={() => (
            <IconButton
              icon="delete-outline"
              iconColor={colors.error}
              onPress={() => handleDelete(item)}
              testID={`delete-tag-${item.id}`}
            />
          )}
        />
      </Card>
    ),
    [colors.error, handleDelete]
  );

  if (tagsQuery.isLoading) {
    return <LoadingSpinner message="Loading tags..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {tags.length === 0 ? (
        <EmptyState
          title="No tags yet"
          description="Create your first tag to label your todos!"
          actionLabel="Create Tag"
          onAction={openDialog}
        />
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(item) => item.id}
          renderItem={renderTag}
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
        testID="create-tag-fab"
        label="New Tag"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>New Tag</Dialog.Title>
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
              testID="tag-name-input"
            />
            {nameError && (
              <Text variant="bodySmall" style={{ color: colors.error }}>
                Name is required
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              onPress={handleCreate}
              loading={createTag.isPending}
              disabled={createTag.isPending}
              testID="create-tag-submit"
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
  tagChip: {
    marginLeft: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  dialogInput: {
    marginBottom: 8,
  },
});
