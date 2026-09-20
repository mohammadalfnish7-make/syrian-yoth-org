import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, readJsonBodyLimit } from "@/lib/api-utils";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional().or(z.literal("")),
  initiativeIdea: z.string().min(5).max(2000),
  message: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const sizeCheck = readJsonBodyLimit(request, 64 * 1024);
    if (sizeCheck.tooLarge) return apiError("Request too large", 413);

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid data provided.", 400);
    }

    const data = parsed.data;

    await prisma.initiativeRequest.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        initiativeIdea: data.initiativeIdea,
        message: data.message || null,
      },
    });

    return apiSuccess({ message: "Request submitted successfully" }, 201);
  } catch {
    return apiError("Failed to submit request", 500);
  }
}
