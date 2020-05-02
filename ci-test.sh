set -e

./ci.sh test &
unit_test=$!

NODE_ENV=test ./ci.sh run &
(
  cd app
  npx cypress run
)
wait $unit_test
