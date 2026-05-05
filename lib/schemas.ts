import { z } from "zod";

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .transform((s) => s.replace(/<[^>]*>/g, ""));

export const firstNameSchema = safeText(30);

export const eventNameSchema = safeText(80);

export const itemNameSchema = safeText(40);

export const emojiSchema = z.string().min(1).max(8);

export const categorySchema = z.enum([
  "viande",
  "accompagnement",
  "boisson",
  "dessert",
  "autre",
]);

export const cookingPrefSchema = z
  .enum(["saignant", "a_point", "bien_cuit"])
  .nullable()
  .optional();

export const quantitySchema = z.coerce.number().int().min(0).max(20);

export const createEventSchema = z.object({
  name: eventNameSchema,
  eventDate: z.coerce.date().optional().nullable(),
});

export const upsertItemSchema = z.object({
  id: z.string().uuid().optional(),
  eventId: z.string().uuid(),
  name: itemNameSchema,
  emoji: emojiSchema,
  category: categorySchema,
  hasCookingPref: z.boolean(),
  availableQty: z.coerce.number().int().min(0).max(9999).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const joinEventSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4)
    .max(12)
    .regex(/^[a-zA-Z0-9]+$/, "Code invalide"),
  firstName: firstNameSchema,
});

export const upsertSelectionSchema = z.object({
  itemId: z.string().uuid(),
  quantity: quantitySchema,
  cookingPref: cookingPrefSchema,
  notes: safeText(120).optional().nullable(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpsertItemInput = z.infer<typeof upsertItemSchema>;
export type JoinEventInput = z.infer<typeof joinEventSchema>;
export type UpsertSelectionInput = z.infer<typeof upsertSelectionSchema>;
