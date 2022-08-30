import { z } from "zod";

export const envSchema = z.object({
  // Specify your environment variables schema here
  GET_KEY: z.string(),
});
