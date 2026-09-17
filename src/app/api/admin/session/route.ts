import { NextRequest } from "next/server";
import { requireAuth, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_news" });
  if (!auth.success) return auth.response;

  return apiSuccess({
    role: auth.session.role,
    governorateId: auth.session.governorateId,
    username: auth.session.username,
  });
}
