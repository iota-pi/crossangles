# CrossAngles

Welcome to CrossAngles! This is the deployment repository for CrossAngles.

## Running tests

To run the unit tests:

```bash
# Unit tests for web app
./ci.sh test app

# Unit tests for scraper
./ci.sh test scraper
```

Or, to run all the unit tests as they are in the CI pipeline, run:

```bash
./ci.sh test
```

There is also an end-to-end (E2E) test suite for the web-app using Cypress.
These can be run either with or without a graphical window. It is often useful
when debugging tests to watch them while they run.

```bash
# Run the tests in Chrome
./ci.sh cypress open

# Run the tests headless in electron
./ci.sh cypress run
```
