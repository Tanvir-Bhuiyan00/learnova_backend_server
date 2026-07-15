import z from "zod";

export const checkoutZodSchema = z.object({
  body: z.object({}).optional(),
});
