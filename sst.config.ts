/// <reference path="./.sst/platform/config.d.ts" />

const PROD = "production"

export default $config({
  app(input) {
    return {
      name: "crossangles",
      removal: input?.stage === PROD ? "retain" : "remove",
      protect: [PROD].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: 'ap-southeast-2',
        },
        cloudflare: true,
      },
    }
  },
  async run() {
    const stage = $app.stage
    const isProd = stage === PROD

    // 1. Storage (Existing Resources)
    // We import existing resources so SST controls them.
    const table = new sst.aws.Dynamo("ScraperState", {
      fields: {
        campus: "string",
        key: "string",
      },
      primaryIndex: { hashKey: "campus", rangeKey: "key" },
      transform: {
        table: args => {
          args.name = `ScraperState_${stage}`
          args.pointInTimeRecovery = { enabled: false }
        }
      }
    })

    const bucketName = isProd
      ? "crossangles-course-data"
      : `crossangles-course-data-${stage}`

    const bucket = new sst.aws.Bucket("CourseData", {
      public: true,
      transform: {
        bucket: args => {
          args.bucket = bucketName
          args.forceDestroy = false
        }
      }
    })

    // 2. Scraper
    const scraper = new sst.aws.Function("Scraper", {
      handler: "scraper/lambda.handler",
      link: [table, bucket],
      environment: {
        S3_OUTPUT_BUCKET: bucketName,
        STATE_TABLE: `ScraperState_${stage}`,
        ENVIRONMENT: stage,
      },
      timeout: "5 minutes",
      memory: "2048 MB",
    })

    new sst.aws.Cron("ScraperCron", {
      schedule: isProd ? "rate(1 hour)" : "cron(5 19 * * ? *)",
      job: scraper.arn,
    })

    // 3. Contact
    const mailgunKey = new sst.Secret("MAILGUN_API_KEY")

    const contact = new sst.aws.Function("ContactLambda", {
      handler: "contact/index.handler",
      link: [mailgunKey],
      environment: {
        MAILGUN_API_KEY: mailgunKey.value,
      },
      timeout: "10 seconds",
      memory: "256 MB",
    })

    const api = new sst.aws.ApiGatewayV2("ContactApi")
    api.route("POST /", contact.arn)

    // 4. App (Static Site hosted on Cloudflare)
    const site = new sst.cloudflare.StaticSite("CA_App", {
      path: ".",
      build: {
        command: "tsc --noEmit && vite build",
        output: "dist",
      },
      domain: isProd ? "crossangles.app" : undefined,
      environment: {
        VITE_CONTACT_ENDPOINT: api.url,
        VITE_DATA_ROOT_URI: `https://${bucketName}.s3.amazonaws.com`,
        VITE_CAMPUS: "unsw",
      },
    })

    return {
      AppURL: site.url,
      ContactAPI: api.url,
    }
  },
})
