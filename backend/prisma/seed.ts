import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.permission.createMany({
    data: [
      { name: 'PROJECT_READ_ALL', description: 'Read access to projects' },
      { name: 'PROJECT_READ', description: 'Read access to projects' },
      { name: 'PROJECT_WRITE', description: 'Write access to projects' },
      { name: 'PROJECT_DELETE', description: 'Delete access to projects' },

      { name: 'TASK_READ_ALL', description: 'Read access to projects' },
      { name: 'TASK_READ', description: 'Read access to tasks' },
      { name: 'TASK_WRITE', description: 'Write access to tasks' },
      { name: 'TASK_DELETE', description: 'Delete access to tasks' },

      { name: 'USER_READ_ALL', description: 'Read access to projects' },
      { name: 'USER_READ', description: 'Read access to users' },
      { name: 'USER_WRITE', description: 'Write access to users' },
      { name: 'USER_DELETE', description: 'Delete access to users' },

      { name: 'ROLE_READ_ALL', description: 'Read access to projects' },
      { name: 'ROLE_READ', description: 'Read access to roles' },
      { name: 'ROLE_WRITE', description: 'Write access to roles' },
      { name: 'ROLE_DELETE', description: 'Delete access to roles' },

      { name: 'PERMISSION_READ_ALL', description: 'Read access to projects' },
      { name: 'PERMISSION_READ', description: 'Read access to permissions' },
      { name: 'PERMISSION_WRITE', description: 'Write access to permissions' },
      {
        name: 'PERMISSION_DELETE',
        description: 'Delete access to permissions',
      },
    ],
  });

  // Create the Admin role
  const adminRole = await prisma.role.create({
    data: {
      id: 1,
      name: 'Admin',
      description: 'Administrator with full access',
    },
  });

  // Find all permissions
  const allPermissions = await prisma.permission.findMany();

  // Connect all permissions to the Admin role
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: allPermissions.map((permission) => ({ id: permission.id })),
      },
    },
  });

  await prisma.role.create({
    data: {
      id: 2,
      name: 'User',
      description: 'Regular user with limited access',
      permissions: {
        connect: allPermissions
          .filter((permission) => !permission.name.endsWith('_ALL'))
          .map((permission) => ({ id: permission.id })),
      },
    },
  });

  await prisma.user.create({
    data: {
      username: 'superadmin',
      password: '$2b$08$eh/yFHX8xTtNB47UXHZMWuB.C76lYQtjagX5uxTJ8ZPQJonYWytQO', // superamin@123
      name: 'Admin User',
      role: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        connect: { id: adminRole.id },
      },
    },
  });
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
