import { Tag } from "@prisma/client";
import { z } from "zod";

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(30, "Title must be at most 30 characters."),

  description: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters.")
      .max(500, "Description must be at most 500 characters."),
  ]),

  image: z
    .file()
    .min(1, "File is required")
    .max(5 * 1024 * 1024, "Max 5MB")
    .mime(["image/png", "image/jpeg"])
    .optional(),

  tags: z.array(z.enum(Tag)).min(1, "Please select at least one tag."),
});
