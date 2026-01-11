# CrossAngles

Welcome to CrossAngles! This is the development repository. To use the planner, go to https://crossangles.app

## Overview

CrossAngles is a React application powered by an SST (Serverless Stack) backend on AWS and Cloudflare.

- **Frontend**: React, Material UI, Vite (hosted by Cloudflare)
- **Backend**: AWS Lambda, DynamoDB, Amazon S3 (managed via SST)
- **Scraper**: TypeScript-based scraper for course data

## Getting Started

### Prerequisites

- Node.js (v20+)
- Yarn

### Setup

```bash
yarn install
```

## Development

### Web App
To start the development server (Vite):
```bash
yarn start
```
The app will be available at `http://localhost:3000`.

### Backend (SST)
To start the SST development environment (connects to AWS):
```bash
yarn dev
```

To deploy your own version of the app to your AWS account (AWS credentials required):
```bash
yarn deploy
```
*Production deployments are handled via CI/CD pipelines.*

### Local Scraper
To run the scraper locally for testing:
```bash
cd scraper/scraper/unsw
npx tsx launchTimetable.ts
```

## Testing & Linting

We use Vitest for testing and ESLint for linting.

```bash
# Run unit tests
yarn test

# Lint code
yarn lint

# Run type checking
yarn typecheck
```

*Note: There is also a legacy `ci.sh` script, but `yarn` scripts are preferred.*

## Contributing

If you wish to contribute, please fork this repository and submit a pull request.
