import * as fs from "fs";

import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import formidable, { File } from "formidable";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { UPLOAD_DIR } from "constants/settings";
import { uploadFile } from "utils/aws-s3";
import { serverConfig } from "config";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const form = formidable({ multiples: false, uploadDir: UPLOAD_DIR });
  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const file = files.file as File;
      let fileName;
      if (serverConfig.storageType === "s3") {
        fileName = await uploadFile(serverConfig.env, file);
      } else {
        fileName = fields.newFileName || file.originalFilename;
        await fs.renameSync(file.filepath, `${UPLOAD_DIR}/${fileName}`);
      }
      res.status(200).json({ data: { fileName } });
    }
  });
});

export default handler;
