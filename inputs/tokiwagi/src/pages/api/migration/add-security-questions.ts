import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

export const SECURITY_QUESTION_SEEDS = [
  { question: "本社オフィスのドアの色は？", answer: "赤色" },
  { question: "本社大会議室の椅子の数は？", answer: "8脚" },
  { question: "本社の本店倉庫の隣の会議室は？", answer: "5番会議室" },
  { question: "本社ショールームに行くまでに通過する部署は？", answer: "総務部" },
  { question: "社長室の個人デスクの数は？", answer: "2個" },
];

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const securityQuestions = await prisma.securityQuestion.createMany({
    data: SECURITY_QUESTION_SEEDS,
  });

  res.status(200).json({
    data: securityQuestions,
  });
});

export default handler;
