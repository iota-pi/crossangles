# CrossAngles

Welcome to CrossAngles! This is the official repository for the unofficial
timetable planner. This repository is for the development of CrossAngles,
if you're looking for the app to use it, you can find it at:
https://crossangles.app

## Getting started

To get started with developing locally, clone the repository, and install the
dependencies using:

```bash
npm install
```

## Running the app development server

To build and serve the web app locally, you can use:

```bash
npm start
```

## Running tests

```bash
# Run the unit tests
npm test

# Lint the code
npm run lint
```

The unit tests use Jest, and linting is done with ESLint.

There is also an end-to-end (E2E) test suite using Cypress. These E2E tests can
be run either with or without a graphical window. It can sometimes be useful
when debugging to watch the tests as they run.

```bash
# Run the tests in Chrome
./ci.sh cypress open

# Run the tests headless in electron
./ci.sh cypress run
```

## Contributing

If you wish to contribute you are very welcome to fork this repository and
submit pull requests, but please refrain from distributing it or any
derivatives.

### Adding tests and making changes
When adding new features or touching existing code it is expected to add
suitable test coverage for the code as well. Usually, for `example.ts`, the
tests would go in `example.spec.ts`.

### Automated Testing
This repository has automated testing set up, and it will run all the tests on
the code before your PR can be merged.

### Code Review
Another quality gate is the code review process. At least one person must review
each pull-request before it can be merged.
