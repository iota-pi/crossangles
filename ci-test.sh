set -e

./ci.sh test &
unit_test=$!

./ci.sh build
./ci.sh run --prod &
(
  cd app
  CYPRESS_BASE_URL=http://localhost:5000 \
    npx cypress run
)
wait $unit_test
