import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const boxes = sqliteTable("boxes", {
  id: text("id").primaryKey(),
  payload: text("payload").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const uploadedAssets = sqliteTable(
  "uploaded_assets",
  {
    id: text("id").primaryKey(),
    boxId: text("box_id")
      .notNull()
      .references(() => boxes.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull().unique(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_uploaded_assets_box_id").on(table.boxId)],
);
