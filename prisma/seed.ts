import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleWords = [
  { englishWord: "Ephemeral", meaning: "খুব অল্প সময়ের জন্য স্থায়ী", exampleSentence: "The beauty of a sunset is ephemeral.", difficultyLevel: 2, tags: "academic" },
  { englishWord: "Aesthetic", meaning: "সৌন্দর্যবোধ সম্পর্কিত", exampleSentence: "The aesthetic design of the building was breathtaking.", difficultyLevel: 2, tags: "academic,art" },
  { englishWord: "Vibrant", meaning: "প্রাণবন্ত, উজ্জ্বল", exampleSentence: "The city has a vibrant nightlife.", difficultyLevel: 1, tags: "common" },
  { englishWord: "Meticulous", meaning: "অত্যন্ত সতর্ক ও যত্নশীল", exampleSentence: "She was meticulous in her research.", difficultyLevel: 3, tags: "academic,IELTS" },
  { englishWord: "Resilient", meaning: "দ্রুত পুনরুদ্ধার করতে সক্ষম", exampleSentence: "Children are often more resilient than adults.", difficultyLevel: 2, tags: "academic,IELTS" },
  { englishWord: "Profound", meaning: "গভীর, অত্যন্ত গুরুত্বপূর্ণ", exampleSentence: "The book had a profound impact on me.", difficultyLevel: 2, tags: "academic" },
  { englishWord: "Eloquent", meaning: "বাগ্মী, সুবক্তা", exampleSentence: "She gave an eloquent speech at the conference.", difficultyLevel: 3, tags: "academic,IELTS" },
  { englishWord: "Tenacious", meaning: "একগুঁয়ে, দৃঢ়প্রতিজ্ঞ", exampleSentence: "His tenacious spirit helped him overcome every obstacle.", difficultyLevel: 3, tags: "academic" },
];

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { dailyQuizCoins: 20 },
    create: { id: "singleton", newUserCoins: 50, generationCost: 10, dailyQuizCoins: 20 },
  });

  await prisma.coinPackage.createMany({
    data: [
      { name: "Starter Pack", coins: 500, priceUsd: 50 },
      { name: "Value Pack", coins: 2000, priceUsd: 150 },
      { name: "Pro Pack", coins: 10000, priceUsd: 500 },
    ],
    skipDuplicates: true,
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@lexivault.app" },
    update: {},
    create: {
      name: "Alex Rahman",
      email: "demo@lexivault.app",
      passwordHash,
      nativeLanguage: "Bengali",
      dailyGoal: 10,
      coins: 50,
      streak: {
        create: {
          currentDays: 12,
          longestDays: 21,
          totalXP: 2400,
          level: 25,
          lastActivity: new Date(),
        },
      },
    },
  });

  console.log(`✅ Demo user: demo@lexivault.app / password123`);

  for (const w of sampleWords) {
    const existing = await prisma.word.findFirst({ where: { userId: user.id, englishWord: w.englishWord } });
    if (!existing) {
      await prisma.word.create({
        data: {
          ...w,
          userId: user.id,
          wordStats: {
            create: {
              correctCount: Math.floor(Math.random() * 5),
              wrongCount: Math.floor(Math.random() * 3),
              lastReviewed: new Date(),
            },
          },
        },
      });
    }
  }

  console.log(`✅ ${sampleWords.length} sample words added`);
  console.log("🎉 Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
