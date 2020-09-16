#!/bin/bash

dc="docker-compose"
dcl="$dc logs -f --no-color"

echo "Starting container"
$dc up -d

echo "Checking the logs"
pids=()
timeout 1 $dcl | grep -qxm1 "node1_1  |   + tcp incoming" &
pids+=($!)
timeout 1 $dcl | grep -qxm1 "node2_1  |   + tcp incoming" &
pids+=($!)
timeout 1 $dcl | grep -qEm2 "node3_1 +\| +\+ tcp .* local direct" &
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
