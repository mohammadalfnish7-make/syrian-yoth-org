import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/api-utils";
import {
  buildRequestsWorkbook,
  formatRequestDate,
  requestStatusLabel,
} from "@/lib/requests-excel";

const TYPES = ["volunteer", "partner", "program", "initiative"] as const;
type RequestType = (typeof TYPES)[number];

function isRequestType(value: string): value is RequestType {
  return TYPES.includes(value as RequestType);
}

function cell(value: string | null | undefined) {
  return value?.trim() ? value : "";
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { permission: "view_requests" });
  if (!auth.success) return auth.response;

  const type = request.nextUrl.searchParams.get("type") || "";
  if (!isRequestType(type)) {
    return apiError("نوع الطلب غير صالح.", 400);
  }

  if (type !== "volunteer" && auth.session.role !== "SUPER_ADMIN") {
    return apiError("ليس لديك صلاحية.", 403);
  }

  const govFilter =
    auth.session.role === "GOVERNORATE_ADMIN" && auth.session.governorateId
      ? { governorateId: auth.session.governorateId }
      : {};

  let sheetName = "الطلبات";
  let filename = "requests.xlsx";
  let headers: string[] = [];
  let rows: string[][] = [];

  if (type === "volunteer") {
    const records = await prisma.volunteerRequest.findMany({
      where: govFilter,
      include: { governorate: { select: { nameAr: true, nameEn: true } } },
      orderBy: { submittedAt: "desc" },
    });
    sheetName = "طلبات التطوع";
    filename = "volunteer-requests.xls";
    headers = ["الاسم", "الهاتف", "البريد", "المحافظة", "الرسالة", "الحالة", "التاريخ"];
    rows = records.map((record) => [
      record.fullName,
      record.phone,
      cell(record.email),
      record.governorate.nameAr,
      cell(record.message),
      requestStatusLabel(record.status),
      formatRequestDate(record.submittedAt),
    ]);
  } else if (type === "partner") {
    const records = await prisma.partnerRequest.findMany({
      orderBy: { submittedAt: "desc" },
    });
    sheetName = "طلبات الشراكة";
    filename = "partner-requests.xls";
    headers = ["المؤسسة", "المسؤول", "الهاتف", "البريد", "الرسالة", "الحالة", "التاريخ"];
    rows = records.map((record) => [
      record.orgName,
      record.contactPerson,
      record.phone,
      cell(record.email),
      cell(record.message),
      requestStatusLabel(record.status),
      formatRequestDate(record.submittedAt),
    ]);
  } else if (type === "program") {
    const records = await prisma.programRequest.findMany({
      orderBy: { submittedAt: "desc" },
    });
    sheetName = "طلبات البرامج";
    filename = "program-requests.xls";
    headers = ["الاسم", "الهاتف", "البريد", "البرنامج", "الرسالة", "الحالة", "التاريخ"];
    rows = records.map((record) => [
      record.fullName,
      record.phone,
      cell(record.email),
      record.programName,
      cell(record.message),
      requestStatusLabel(record.status),
      formatRequestDate(record.submittedAt),
    ]);
  } else {
    const records = await prisma.initiativeRequest.findMany({
      orderBy: { submittedAt: "desc" },
    });
    sheetName = "طلبات المبادرات";
    filename = "initiative-requests.xls";
    headers = ["الاسم", "الهاتف", "البريد", "فكرة المبادرة", "الرسالة", "الحالة", "التاريخ"];
    rows = records.map((record) => [
      record.fullName,
      record.phone,
      cell(record.email),
      record.initiativeIdea,
      cell(record.message),
      requestStatusLabel(record.status),
      formatRequestDate(record.submittedAt),
    ]);
  }

  const workbook = buildRequestsWorkbook(sheetName, headers, rows);

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
