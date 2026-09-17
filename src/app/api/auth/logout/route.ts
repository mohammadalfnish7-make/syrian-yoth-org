import { cookies } from "next/headers";
import { getClearCookieOptions } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-utils";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(getClearCookieOptions());
  return apiSuccess({ message: "تم تسجيل الخروج بنجاح." });
}
