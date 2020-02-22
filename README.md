# CrossAngles

Welcome to CrossAngles!

## Getting started

To get started with developing locally, clone the repository, then in the
repository root directory, run the following commands to build and run the
scraper:

```bash
./ci.sh build scraper
./ci.sh scrape unsw
```

This will run the UNSW scraper and get you up-to-date course data which you can
use when running locally.

If you're making frequent changes to the scraper, you can run the build in
watch-mode, which means you don't have to manually build it after each change.

```bash
./ci.sh build scraper -w
```

To run the web app, run:

```bash
./ci.sh run
```

## Running tests

To run the unit tests for the web app, run:

```bash
./ci.sh test app
```

To run the unit tests for the scraper, run:

```bash
./ci.sh test scraper
```

There is also an end-to-end (E2E) test suite for the web-app using Cypress.
These can be run either with or without a graphical window. It is often useful
when debugging tests to watch them while they run.

```bash
# Run tests in Chrome
./ci.sh cypress open

# Run tests headless in electron
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
on the code before your PR can be merged. This process helps with making
progress quickly, and having confidence that our changes won't cause any issues
in other parts of the app.

### Code Review
Another quality gate is the code review process. At least one person must review
a pull-request before it can be merged. This is intended to keep the quality of
the code-base high which, once again, helps us to move fast and not break
things.

It's also a great opportunity for both the developer and the reviewer to think
critically about code and become better developers.

### Merging
One the PR has been approved and the status checks (CI tests) have passed, the
branch can be merged into master. Now you can make a new branch and start work
on a new feature!
