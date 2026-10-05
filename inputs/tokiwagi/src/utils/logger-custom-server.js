require("dotenv").config();
const DailyRotateFile = require("winston-daily-rotate-file");
const winston = require("winston");
const WinstonCloudWatch = require("winston-cloudwatch");

const logFormat = winston.format.printf(info => {
  const formattedDate = info.timestamp;
  return `[${formattedDate}][${info.level}]${JSON.stringify(info.message)}`;
});

const dailyRotateFile = new DailyRotateFile({
  level: process.env.LOG_LEVEL,
  filename: "./logs/%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "90d"
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
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
      level: process.env.LOG_LEVEL,
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
      level: process.env.LOG_LEVEL,
      logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP,
      logStreamName: "logger",
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      messageFormatter: function(logObject) {
        const formattedDate = logObject.timestamp;
        const message = `[${formattedDate}][${logObject.level}]${JSON.stringify(logObject.message)}`;
        return message;
      }
    })
  );
}

module.exports = logger;
