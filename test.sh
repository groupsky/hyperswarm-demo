#!/bin/bash

timeout="90s"
dc="docker-compose"
dcl="$dc logs -f --no-color"

echo "Starting container"
$dc up -d

echo "Checking the logs"
pids=()
timeout $timeout $dcl | grep -Em1 "node1_1.*tcp incoming" || $(echo 'node1 failed' && false) &
pids+=($!)
timeout $timeout $dcl | grep -Em1 "node2_1.*tcp incoming" || $(echo 'node2 failed' && false) &
pids+=($!)
timeout $timeout $dcl | grep -Em2 "node3_1.*tcp .* local direct" || $(echo 'node3 failed' && false) &
pids+=($!)
wait "${pids[@]}"
res=$?
if [ $res != 0 ]; then
  echo "Logs check failed" >&1
  $dc logs
else
  echo "Logs check success"
fi

exit $res
