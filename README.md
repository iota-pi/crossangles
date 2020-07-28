# CrossAngles

Welcome to CrossAngles!

## Getting started

To get started with developing locally, clone the repository, and install the
dependencies using:

```bash
./ci.sh install
```

## Running the app development server

To build and serve the web app locally, you can use:

```bash
./ci.sh run
# OR
cd app && npm start
```

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

## Contributing

### Making a branch
To get started making changes, create a new branch from master:

```bash
git checkout master && git pull # make sure you're on the latest master
git checkout -b awesome_feature # pick a branch name thats short and descriptive
```

### Adding tests and making changes
Usually, for `example.ts`, the tests should go in `example.spec.ts`. All new
features and bugfixes should have accompanying tests.

Make your changes, then when you're ready to commit them, you can review your
changes with:

```bash
git status
git diff
```

And then commit them with

```bash
git commit -am "Adds awesome feature"
```

### Submitting a pull-request
Push your branch and set the remote tracking branch

```bash
git push -u origin HEAD
```

For future changes on the same branch, you can just use `git push`

In the GitHub UI, create a pull-request (aka. PR) and add a description of your change.
In your description it's usually a good idea to include both the **what** and
the **why** of your change.

### Continuous Integration
This repository has continuous integration set up, and will run all the tests
on the code before your PR can be merged.

### Code Review
Another quality gate is the code review process. At least one person must review
a pull-request before it can be merged.
