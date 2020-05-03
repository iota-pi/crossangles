set -e

./ci.sh test &
unit_test=$!

LOCAL_DATA=1 ./ci.sh run &
(
  cd app
  npx cypress run
)
wait $unit_test
