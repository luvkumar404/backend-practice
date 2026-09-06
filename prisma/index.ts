import "dotenv/config"
import { PrismaClient } from "./generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {

  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create
  const user = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      posts: {
        create: [{ title: "My first post" }],
      },
    },
  });

  // Read
  const users = await prisma.user.findMany({
    include: { posts: true },
  });

  // Read one
  const oneUser = await prisma.user.findUnique({
    where: { email: "alice@example.com" },
  });

  // Update
  await prisma.user.update({
    where: { id: user.id },
    data: { name: "Alice Smith" },
  });

  // Delete
  await prisma.user.delete({
    where: { id: user.id },
  });

  //Filtering, sorting, pagination
  const posts = await prisma.post.findMany({
    where: {
        published: true,
        title: { contains: "Prisma" },
    },
    orderBy: { title: "asc" },
    skip: 0,
    take: 10,
    });

  console.log(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());