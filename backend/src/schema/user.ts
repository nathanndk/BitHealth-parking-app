import { z } from "zod";

export const SignUpSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["OFFICER", "USER"]).optional(), // baru
});

const LoginSchema = z.object({
  username: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
