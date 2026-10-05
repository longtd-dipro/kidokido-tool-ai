import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import WinstonCloudWatch from "winston-cloudwatch";

import { serverConfig } from "config";

const logFormat = winston.format.printf(info => {
  const formattedDate = info.timestamp;
  return `[${formattedDate}][${info.level}]${JSON.stringify(info.message)}`;
});

const dailyRotateFile = new DailyRotateFile({
  level: serverConfig.logger.level,
  filename: `${serverConfig.logger.folder_path}/%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "90d"
});

const logger = winston.createLogger({
  level: serverConfig.logger.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
  ),
  transports: [
    dailyRotateFile
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      level: serverConfig.logger.level,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      )
    })
  );
}

if (process.env.ENABLE_CLOUDWATCH_LOG) {
  logger.add(
    new WinstonCloudWatch({
      level: serverConfig.logger.level,
      logGroupName: serverConfig.aws.aws_cloudwatch_log_group,
      logStreamName: "logger",
      awsAccessKeyId: serverConfig.aws.aws_access_key_id,
      awsSecretKey: serverConfig.aws.aws_secret_access_key,
      awsRegion: serverConfig.aws.region,
      messageFormatter: function(logObject) {
        const formattedDate = logObject.timestamp;
        const message = `[${formattedDate}][${logObject.level}]${JSON.stringify(logObject.message)}`;
        return message;
      }
    })
  );
}

export default logger;
