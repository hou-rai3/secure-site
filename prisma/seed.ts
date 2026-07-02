import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { prisma } from "@/libs/prisma";
import { Role, UserStatus } from "@/generated/prisma/enums";
import { UserSeed, userSeedSchema } from "../src/app/_types/UserSeed";
import { getPasswordStrength } from "../src/app/_types/CommonSchemas";

const main = async () => {
  console.log("Seeding database...");

  const userSeeds: (UserSeed & { status?: UserStatus })[] = [
    {
      name: "Admin User",
      password: "AdminPass1111!",
      email: "admin01@example.com",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    {
      name: "General User",
      password: "UserPass1111!",
      email: "user01@example.com",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      aboutSlug: "user01",
      aboutContent: "一般ユーザーの公開プロフィールです。",
    },
    {
      name: "Suspended User",
      password: "StopPass1111!",
      email: "suspended@example.com",
      role: Role.USER,
      status: UserStatus.SUSPENDED,
    },
  ];

  userSeeds.forEach((userSeed, index) => {
    const result = userSeedSchema.safeParse(userSeed);
    if (!result.success) {
      console.error(`Validation error in record ${index}`);
      console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
      throw new Error(`Validation failed at record ${index}`);
    }
  });

  await prisma.loginHistory.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    userSeeds.map(async (userSeed) => ({
      id: uuid(),
      name: userSeed.name,
      passwordHash: await bcrypt.hash(userSeed.password, 12),
      passwordStrength: getPasswordStrength(userSeed.password),
      passwordUpdatedAt: new Date(),
      role: userSeed.role,
      status: userSeed.status || UserStatus.ACTIVE,
      email: userSeed.email,
      aboutSlug: userSeed.aboutSlug || null,
      aboutContent: userSeed.aboutContent || "",
    })),
  );
  await prisma.user.createMany({ data: users });

  console.log("Seeding completed successfully.");
};

main()
  .catch((e) => console.error(e.message))
  .finally(async () => {
    await prisma.$disconnect();
  });
