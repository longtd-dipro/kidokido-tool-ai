export const serverConfig = {
  env: process.env.ENV,
  auth: {
    url: process.env.NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  email: {
    enable_aws_ses: process.env.ENABLE_AWS_SES === "true",
    from_email: process.env.EMAIL_FROM,
    server: {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
    },
  },
  external: {
    url: process.env.EXTERNAL_URL,
  },
  logger: {
    folder_path: process.env.LOG_FOLDER_PATH,
    level: process.env.LOG_LEVEL,
  },
  providers: {
    line: {
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    },
  },
  pos: {
    apiKey: process.env.POS_API_KEY,
  },
  gmo: {
    token_url: process.env.NEXT_PUBLIC_TOKEN_URL,
    api_url: process.env.GMO_API_URL,
    shop_id: process.env.NEXT_PUBLIC_GMO_SHOP_ID,
    shop_pass: process.env.GMO_SHOP_PASS,
    site_id: process.env.GMO_SITE_ID,
    site_pass: process.env.GMO_SITE_PASS,
  },
  smaregi: {
    apiBaseUrl: process.env.SMAREGI_API_BASE_URL,
    // OAuth host, e.g. https://id.smaregi.dev (token endpoint built as `${idBaseUrl}/app/${contractId}/token`)
    idBaseUrl: process.env.SMAREGI_ID_BASE_URL,
    clientId: process.env.SMAREGI_CLIENT_ID,
    clientSecret: process.env.SMAREGI_CLIENT_SECRET,
    // space-separated scopes, e.g. "pos.products:write pos.transactions:read pos.transactions:write"
    scopes: process.env.SMAREGI_SCOPES,
  },
  storageType: process.env.STORAGE_TYPE,
  aws: {
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      common_bucket: process.env.AWS_S3_COMMON_BUCKET,
    },
    region: process.env.AWS_REGION,
    aws_cloudwatch_log_group: process.env.AWS_CLOUDWATCH_LOG_GROUP,
  },
  cronJob: {
    enable: process.env.ENABLE_CRON_JOB === "true",
  },
  debug: process.env.DEBUG === "true",
};
