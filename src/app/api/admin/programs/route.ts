import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { programData } from "@/lib/program-input";

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
    const data = programData(await request.json());
    if (!data.title || !data.description) {
      return apiError("العنوان والوصف مطلوبان.");
    }

    const program = await prisma.program.create({ data });

    return apiSuccess(program, 201);
  } catch {
    return apiError("فشل إضافة البرنامج.", 500);
  }
}
