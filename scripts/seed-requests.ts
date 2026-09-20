import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const governorate = await prisma.governorate.findFirst();
  if (!governorate) {
    console.log("No governorate found, skipping volunteer request creation.");
    return;
  }

  console.log("Creating dummy requests...");

  await prisma.volunteerRequest.create({
    data: {
      fullName: "أحمد التطوعي",
      phone: "0999999999",
      email: "ahmad@example.com",
      governorateId: governorate.id,
      message: "أرغب بالتطوع والمشاركة في الفعاليات.",
      status: "new",
    },
  });

  await prisma.partnerRequest.create({
    data: {
      orgName: "مؤسسة الأمل",
      contactPerson: "سارة الشراكة",
      phone: "0988888888",
      email: "sara@hope.org",
      message: "نود بناء شراكة استراتيجية.",
      status: "new",
    },
  });

  await prisma.programRequest.create({
    data: {
      fullName: "خالد البرنامجي",
      phone: "0977777777",
      programName: "أكاديمية قادة الشباب",
      message: "أرغب بالتسجيل في هذا البرنامج.",
      status: "new",
    },
  });

  await prisma.initiativeRequest.create({
    data: {
      fullName: "منى المبادرة",
      phone: "0966666666",
      initiativeIdea: "مبادرة لتنظيف الحدائق العامة.",
      message: "لدينا فريق صغير ونحتاج للدعم.",
      status: "new",
    },
  });

  console.log("Dummy requests created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
