import { PrismaClient } from "@prisma/client";

import { standardizeEpochDate } from "utils/date-time";

interface StandardizeDBTimeField {
  [key: string]: string[];
}

export const standardizeDBTimeField = (prisma: PrismaClient, standardizeDBTimeModels: StandardizeDBTimeField) => {
  prisma.$use(async (params, next) => {
    let result = await next(params);
    if (!result) {
      return result;
    }

    const mainModel = params.model;
    let includeModels = [];
    if (params.args?.include) {
      includeModels = Object.keys(params.args.include);
    }
    const queryModels = includeModels.concat([mainModel]);

    for (const queryModel of queryModels) {
      if (standardizeDBTimeModels[queryModel]) {
        const fields = standardizeDBTimeModels[queryModel];
        if (result instanceof Array) {
          for (let i = 0; i < result.length; i++) {
            result[i] = standardizeRecord(result[i], fields, queryModel, mainModel, includeModels);
          }
        } else {
          result = standardizeRecord(result, fields, queryModel, mainModel, includeModels);
        }
      }
    }
    return result;
  });
};

const standardizeRecord = (result, fields: string[], queryModel: string, mainModel: string, includeModels: string[]) => {
  fields.forEach(field => {
    if (queryModel === mainModel) {
      if (result[field]) {
        result[field] = standardizeEpochDate(result[field]);
      }
    } else if (includeModels.includes(queryModel)) {
      if (result[queryModel]) {
        if (result[queryModel] instanceof Array) {
          for (let i = 0; i < result[queryModel].length; i++) {
            if (result[queryModel][i][field]) {
              result[queryModel][i][field] = standardizeEpochDate(result[queryModel][i][field]);
            }
          }
        } else {
          if (result[queryModel][field]) {
            result[queryModel][field] = standardizeEpochDate(result[queryModel][field]);
          }
        }
      }
    }
  });

  return result;
};
