import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken, getTokenCookieOptions } from "@/lib/auth";
import { apiError, apiSuccess, readJsonBodyLimit } from "@/lib/api-utils";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SEC = 900;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const sizeCheck = readJsonBodyLimit(request, MAX_BODY_BYTES);
    if (sizeCheck.tooLarge) {
      return apiError("حجم الطلب كبير جداً.", 413);
    }

    const body = await request.json();
    const rawUsername =
      typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!rawUsername || !password) {
      return apiError("اسم المستخدم وكلمة المرور مطلوبان.");
    }

    const ip = getClientIp(request);
    const rateKey = `login:${ip}:${rawUsername.toLowerCase()}`;
    const rate = checkRateLimit(rateKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SEC);
    if (!rate.allowed) {
      return apiError("محاولات كثيرة. حاول لاحقاً.", 429);
    }

    // Try exact findUnique first, then fallback to case-insensitive findFirst
    let admin = await prisma.admin.findUnique({
      where: { username: rawUsername.toLowerCase() },
      include: { governorate: true },
    });

    if (!admin && rawUsername !== rawUsername.toLowerCase()) {
      admin = await prisma.admin.findUnique({
        where: { username: rawUsername },
        include: { governorate: true },
      });
    }

    if (!admin) {
      admin = await prisma.admin.findFirst({
        where: {
          username: {
            equals: rawUsername,
            mode: "insensitive",
          },
        },
        include: { governorate: true },
      });
    }

    if (!admin || !admin.isActive) {
      return apiError("بيانات الدخول غير صحيحة.", 401);
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return apiError("بيانات الدخول غير صحيحة.", 401);
    }

    clearRateLimit(rateKey);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const token = await signToken({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      governorateId: admin.governorateId,
    });

    const cookieStore = await cookies();
    cookieStore.set(getTokenCookieOptions(token));

    return apiSuccess({
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        governorate: admin.governorate
          ? { id: admin.governorate.id, nameAr: admin.governorate.nameAr }
          : null,
      },
    });
  } catch {
    return apiError("حدث خطأ أثناء تسجيل الدخول.", 500);
  }
}
