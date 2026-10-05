import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  UPLOAD: "/api/upload",
};

export const upload = async (file: File, newFileName?: string) => {
  const body = new FormData();
  body.append("file", file);
  if (newFileName) {
    body.append("newFileName", newFileName);
  }

  const { data }: { data: IResponse } = await axios.post(APIs.UPLOAD, body, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data.data;
};
