import { auth } from "@/auth";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import { eq } from "drizzle-orm";

export type RegistrationRole = "CLIENT" | "PROGRAMMER";

export const registerUser = async (role: RegistrationRole, body: { email: string; name: string; password: string }) => {
  const created = await auth.api.signUpEmail({ body, returnHeaders: true });
  const [user] = await db.update(schemas.user)
    .set({ role })
    .where(eq(schemas.user.id, created.response.user.id))
    .returning();

  return { user, headers: created.headers };
};
