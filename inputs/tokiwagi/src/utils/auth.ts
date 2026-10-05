import { hash, compare } from "bcryptjs";
import { AdminTenant, User } from ".prisma/client";

import prisma from "utils/db";
import { MAXIMUM_ALLOWED_LOGIN_ATTEMPTS } from "constants/common";

export async function checkExistingEmailIncludeDeleted(email: string): Promise<boolean> {
  const users: User[] = await prisma.$queryRaw`
    select * from users
    where email = ${email} 
  `;

  return users.length > 0;
}

export async function checkExistingToken(token: string): Promise<boolean> {
  const user = await getUserByToken(token);
  return !!user;
}

export async function getUserByToken(token: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: {
      token,
    },
  });
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}

export async function getAdminTenantByUserId(userId: number): Promise<AdminTenant | null> {
  const adminTenant = await prisma.adminTenant.findUnique({
    where: {
      userId: userId,
    },
  });
  return adminTenant;
}

export async function verifyPassword(lPassword: string, password: string): Promise<boolean> {
  return await compare(lPassword, password);
}

export async function getRoleByUserId(id: number): Promise<string> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) return "";

  return user.role;
}

export async function markAccountAsVerified(token: string) {
  const user = await prisma.user.update({ where: { token }, data: { emailVerified: new Date() } });

  return user;
}

export async function updatePassword(token: string, hashedPassword: string) {
  const user = await prisma.user.update({
    where: { token },
    data: { password: hashedPassword },
  });

  return user;
}

export const increaseLoginAttempts = async (user: User) => {
  const loginAttempts = (user.loginAttempts || 0) + 1;
  const locked = loginAttempts === MAXIMUM_ALLOWED_LOGIN_ATTEMPTS || undefined;

  const dataToUpdate = {
    loginAttempts,
    locked,
  };

  return prisma.user.update({
    where: { id: user.id },
    data: dataToUpdate,
  });
};

export const resetLoginAttempts = async (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
    },
  });
};

export const unlockAccount = async (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      locked: false,
      loginAttempts: 0,
    },
  });
};

export const isMatchingSecurityAnswer = async (questionId: number, enteredAnswer: string) => {
  const question = await prisma.securityQuestion.findUnique({ where: { id: +questionId } });

  if (!question) return false;

  return question.answer === enteredAnswer.toLowerCase();
};
