#!/usr/bin/env bash
set -euo pipefail

LAMBDA_BUCKET="crossangles-lambda-code"

# Build scraper and copy to lambda
CI=1 npm run test src/scraper
npm run scraper:build
cd build
zip scraper.zip scraper
aws s3 cp scraper.zip s3://$LAMBDA_BUCKET/scraper/scraper.zip
