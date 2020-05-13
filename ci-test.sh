set -e

./ci.sh test &
unit_test=$!

./ci.sh build app
./ci.sh run --prod &
(
  cd app
  # TODO: use staging deployment for testing release PRs
  CYPRESS_BASE_URL=http://localhost:5000 \
    npx cypress run
)
wait $unit_test
