import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";
import type { AdminRole } from "@prisma/client";

type AuthOptions = {
  permission?: Permission;
  roles?: AdminRole[];
};

export async function requireAuth(
  _request: NextRequest,
  options: AuthOptions = {}
): Promise<
  | {
      success: true;
      session: NonNullable<Awaited<ReturnType<typeof getVerifiedSession>>>;
    }
  | { success: false; response: NextResponse }
> {
  const session = await getVerifiedSession();

  if (!session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "غير مصرح. يرجى تسجيل الدخول." },
        { status: 401 }
      ),
    };
  }

  if (options.roles && !options.roles.includes(session.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "ليس لديك صلاحية للوصول." },
        { status: 403 }
      ),
    };
  }

  if (options.permission && !hasPermission(session.role, options.permission)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "ليس لديك صلاحية لهذا الإجراء." },
        { status: 403 }
      ),
    };
  }

  return { success: true, session };
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function readJsonBodyLimit(request: NextRequest, maxBytes: number) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) {
    return { tooLarge: true as const };
  }
  return { tooLarge: false as const };
}
