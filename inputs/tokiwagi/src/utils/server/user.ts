import prisma from "utils/db";
import { DELETED_EMAIL_PREFIX } from "constants/common";

export const deleteUser = async (userId: number, deletedBy: string) => {
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  const email = currentUser?.email ? `${DELETED_EMAIL_PREFIX}${Math.floor(Date.now() / 1000)}_${currentUser.email}` : currentUser?.email;

  const deletedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedBy,
      deleted: true,
      email
    }
  });
  delete deletedUser.password;

  // Delete all related data
  await prisma.account.deleteMany({
    where: {
      userId: userId,
    },
  });

  return deletedUser;
};
