import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, readJsonBodyLimit } from "@/lib/api-utils";
import {
  processAndSaveDocument,
  processAndSaveImage,
} from "@/lib/upload";
import {
  VOLUNTEER_COLLEGES,
  VOLUNTEER_EDUCATION_LEVELS,
  VOLUNTEER_EMPLOYMENT_STATUSES,
  VOLUNTEER_GENDERS,
  VOLUNTEER_HOBBIES,
  VOLUNTEER_STUDY_YEARS,
  VOLUNTEER_UNIVERSITIES,
} from "@/lib/volunteer-form";
import { z } from "zod";

const MAX_BODY_BYTES = 25 * 1024 * 1024;

const schema = z
  .object({
    fullName: z.string().min(2).max(120),
    gender: z.enum(VOLUNTEER_GENDERS),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ الميلاد غير صالح"),
    governorateId: z.string().min(1),
    address: z.string().min(3).max(300),
    phone: z
      .string()
      .min(10)
      .max(20)
      .regex(/^00963\d+$/, "رقم الهاتف يجب أن يبدأ بـ 00963"),
    telegram: z
      .string()
      .min(2)
      .max(64)
      .regex(/^@[A-Za-z0-9_]{3,}$/, "معرف التلغرام يجب أن يبدأ بـ @"),
    hasLinkedIn: z.enum(["نعم", "لا"]),
    employmentStatus: z.enum(VOLUNTEER_EMPLOYMENT_STATUSES),
    workplacePosition: z.string().max(200).optional().or(z.literal("")),
    educationLevel: z.enum(VOLUNTEER_EDUCATION_LEVELS),
    educationLevelOther: z.string().max(120).optional().or(z.literal("")),
    university: z.enum(VOLUNTEER_UNIVERSITIES),
    college: z.enum(VOLUNTEER_COLLEGES),
    studyYear: z.enum(VOLUNTEER_STUDY_YEARS),
    studyYearOther: z.string().max(120).optional().or(z.literal("")),
    hobbies: z
      .array(z.enum(VOLUNTEER_HOBBIES))
      .min(1, "اختر هواية واحدة على الأقل"),
    hobbiesOther: z.string().max(200).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.educationLevel === "أخرى" && !data.educationLevelOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى تحديد المؤهل العلمي",
        path: ["educationLevelOther"],
      });
    }
    if (data.studyYear === "أخرى" && !data.studyYearOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى تحديد السنة الدراسية",
        path: ["studyYearOther"],
      });
    }
    if (data.hobbies.includes("أخرى") && !data.hobbiesOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى تحديد الهواية الأخرى",
        path: ["hobbiesOther"],
      });
    }
  });

function asFile(value: FormDataEntryValue | null): File | null {
  if (!value || typeof value === "string") return null;
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

function parseHobbies(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sizeCheck = readJsonBodyLimit(request, MAX_BODY_BYTES);
    if (sizeCheck.tooLarge) return apiError("Request too large", 413);

    const formData = await request.formData();

    const payload = {
      fullName: String(formData.get("fullName") || ""),
      gender: String(formData.get("gender") || ""),
      dateOfBirth: String(formData.get("dateOfBirth") || ""),
      governorateId: String(formData.get("governorateId") || ""),
      address: String(formData.get("address") || ""),
      phone: String(formData.get("phone") || ""),
      telegram: String(formData.get("telegram") || ""),
      hasLinkedIn: String(formData.get("hasLinkedIn") || ""),
      employmentStatus: String(formData.get("employmentStatus") || ""),
      workplacePosition: String(formData.get("workplacePosition") || ""),
      educationLevel: String(formData.get("educationLevel") || ""),
      educationLevelOther: String(formData.get("educationLevelOther") || ""),
      university: String(formData.get("university") || ""),
      college: String(formData.get("college") || ""),
      studyYear: String(formData.get("studyYear") || ""),
      studyYearOther: String(formData.get("studyYearOther") || ""),
      hobbies: parseHobbies(formData.get("hobbies")),
      hobbiesOther: String(formData.get("hobbiesOther") || ""),
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return apiError("Invalid data provided.", 400);
    }

    const idDocument = asFile(formData.get("idDocument"));
    const personalPhoto = asFile(formData.get("personalPhoto"));
    const cv = asFile(formData.get("cv"));

    if (!idDocument || !personalPhoto || !cv) {
      return apiError("يرجى إرفاق الهوية والصورة الشخصية والسيرة الذاتية.", 400);
    }

    const data = parsed.data;

    const gov = await prisma.governorate.findUnique({
      where: { id: data.governorateId },
    });
    if (!gov) {
      return apiError("Governorate not found", 400);
    }

    const [idDocumentSaved, personalPhotoSaved, cvSaved] = await Promise.all([
      processAndSaveImage(idDocument, "volunteers"),
      processAndSaveImage(personalPhoto, "volunteers"),
      processAndSaveDocument(cv, "volunteer-docs"),
    ]);

    await prisma.volunteerRequest.create({
      data: {
        fullName: data.fullName,
        gender: data.gender,
        dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`),
        governorateId: data.governorateId,
        address: data.address,
        phone: data.phone,
        telegram: data.telegram,
        hasLinkedIn: data.hasLinkedIn === "نعم",
        employmentStatus: data.employmentStatus,
        workplacePosition: data.workplacePosition?.trim() || null,
        educationLevel: data.educationLevel,
        educationLevelOther:
          data.educationLevel === "أخرى"
            ? data.educationLevelOther?.trim() || null
            : null,
        university: data.university,
        college: data.college,
        studyYear: data.studyYear,
        studyYearOther:
          data.studyYear === "أخرى" ? data.studyYearOther?.trim() || null : null,
        hobbies: data.hobbies,
        hobbiesOther: data.hobbies.includes("أخرى")
          ? data.hobbiesOther?.trim() || null
          : null,
        idDocumentUrl: idDocumentSaved.url,
        personalPhotoUrl: personalPhotoSaved.url,
        cvUrl: cvSaved.url,
      },
    });

    return apiSuccess({ message: "Request submitted successfully" }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit request";
    if (
      message.includes("غير مدعوم") ||
      message.includes("يتجاوز") ||
      message.includes("غير صالح")
    ) {
      return apiError(message, 400);
    }
    return apiError("Failed to submit request", 500);
  }
}
