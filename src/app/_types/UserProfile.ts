import { z } from "zod";
import {
  userNameSchema,
  emailSchema,
  roleSchema,
  userStatusSchema,
  uuidSchema,
} from "./CommonSchemas";

export const userProfileSchema = z.object({
  id: uuidSchema,
  name: userNameSchema,
  email: emailSchema,
  role: roleSchema,
  status: userStatusSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
