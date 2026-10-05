const express = require("express");
const next = require("next");
const cors = require("cors");

const logger = require("./utils/logger-custom-server");
require("./utils/bigint");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: "localhost", port });
const handle = app.getRequestHandler();

process
  .on("unhandledRejection", (err) => {
    logger.error(err);
  })
  .on("uncaughtException", (err) => {
    logger.error(err);
  });

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use("/uploads", express.static("./public/uploads"));

  server.use((req, res, next) => {
    const posScanUrl = req.url.startsWith("/api/pos");
    const selfScanUrls =
      req.url.startsWith("/api/admin/bookings/scan") ||
      req.url.startsWith("/api/admin/bookings/rollback-scan");
    if (posScanUrl || selfScanUrls) {
      const [oldWrite, oldEnd] = [res.write, res.end];
      const chunks = [];

      res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
      };

      res.end = function (chunk) {
        if (chunk) {
          chunks.push(Buffer.from(chunk));
        }

        // TODO: Need to investigate remove this condition
        if (chunks.length == 1) {
          const body = Buffer.concat(chunks).toString("utf8");
          logger.info({
            service: "pos",
            type: "response",
            url: req.url,
            statusCode: res.statusCode,
            body: JSON.parse(body),
          });
        }

        oldEnd.apply(res, arguments);
      };
    }
    if (next) {
      next();
    }
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const httpServer = server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  httpServer.keepAliveTimeout = 65 * 1000;
  httpServer.headersTimeout = 66 * 1000;
});
