-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateIndex
CREATE INDEX "tags_on_todos_todo_id_idx" ON "tags_on_todos"("todo_id");
