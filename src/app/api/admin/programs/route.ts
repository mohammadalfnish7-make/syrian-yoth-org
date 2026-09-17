import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  const programs = await prisma.program.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return apiSuccess(programs);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "manage_programs" });
  if (!auth.success) return auth.response;

  try {
    const { title, description, imageUrl } = await request.json();
    if (!title || !description) {
      return apiError("العنوان والوصف مطلوبان.");
    }

    const program = await prisma.program.create({
      data: { title, description, imageUrl: imageUrl || null },
    });

    return apiSuccess(program, 201);
  } catch {
    return apiError("فشل إضافة البرنامج.", 500);
  }
}
