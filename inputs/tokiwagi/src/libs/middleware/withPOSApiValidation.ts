import { NextApiRequest, NextApiResponse } from "next";
import * as Yup from "yup";
import type Lazy from "yup/lib/Lazy";

import { POSResponse } from "models/Response";
import { POS_API_RESULT_CODE } from "constants/pos-api-result";

type Validation = {
  mode?: "body" | "query" | "param" | "headers";
  schema: any;
};

function yupResolver<T extends Yup.AnyObjectSchema | Lazy<any>>(schema: T) {
  return {
    validate: (data: unknown) => schema.validateSync(data),
  };
}

export default function withPOSApiValidation({ schema, mode = "query" }: Validation) {
  return (handler: any) => {
    return async (req: NextApiRequest, res: NextApiResponse<POSResponse>, next?: any) => {
      try {
        const resolver = yupResolver(schema);
        resolver.validate(req[mode]);

        if (next) {
          return next();
        }
        return handler(req, res);
      } catch (error) {
        res.status(200).send({ resultCode: POS_API_RESULT_CODE.E00000400, error: error.message });
      }
    };
  };
}
