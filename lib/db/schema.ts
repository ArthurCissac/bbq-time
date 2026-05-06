import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    eventDate: timestamp("event_date", { mode: "date" }),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    codeIdx: uniqueIndex("events_code_idx").on(t.code),
    activeIdx: index("events_active_idx").on(t.isActive),
  }),
);

export const items = pgTable(
  "items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    emoji: text("emoji").notNull().default("🍖"),
    category: text("category").notNull().default("viande"),
    hasCookingPref: boolean("has_cooking_pref").notNull().default(false),
    availableQty: integer("available_qty"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    eventIdx: index("items_event_idx").on(t.eventId),
  }),
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    token: uuid("token").defaultRandom().notNull().unique(),
    joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
    servedAt: timestamp("served_at", { mode: "date" }),
  },
  (t) => ({
    eventIdx: index("guests_event_idx").on(t.eventId),
    tokenIdx: uniqueIndex("guests_token_idx").on(t.token),
  }),
);

export const selections = pgTable(
  "selections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    cookingPref: text("cooking_pref"),
    notes: text("notes"),
    servedAt: timestamp("served_at", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    guestItemIdx: uniqueIndex("selections_guest_item_idx").on(t.guestId, t.itemId),
    itemIdx: index("selections_item_idx").on(t.itemId),
  }),
);

export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    emoji: text("emoji").notNull().default("🍖"),
    category: text("category").notNull().default("viande"),
    hasCookingPref: boolean("has_cooking_pref").notNull().default(false),
    defaultQty: integer("default_qty").notNull().default(10),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: uniqueIndex("suggestions_name_idx").on(t.name),
  }),
);

export type SuggestionRow = typeof suggestions.$inferSelect;

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    eventIdx: index("push_subs_event_idx").on(t.eventId),
    endpointIdx: uniqueIndex("push_subs_endpoint_idx").on(t.endpoint),
  }),
);

export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;

export const eventsRelations = relations(events, ({ many }) => ({
  items: many(items),
  guests: many(guests),
  pushSubscriptions: many(pushSubscriptions),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  event: one(events, { fields: [items.eventId], references: [events.id] }),
  selections: many(selections),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  event: one(events, { fields: [guests.eventId], references: [events.id] }),
  selections: many(selections),
}));

export const selectionsRelations = relations(selections, ({ one }) => ({
  guest: one(guests, { fields: [selections.guestId], references: [guests.id] }),
  item: one(items, { fields: [selections.itemId], references: [items.id] }),
}));

export type Event = typeof events.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Selection = typeof selections.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type NewItem = typeof items.$inferInsert;
export type NewGuest = typeof guests.$inferInsert;
export type NewSelection = typeof selections.$inferInsert;
