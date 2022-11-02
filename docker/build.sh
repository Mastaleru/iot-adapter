#!/bin/bash

docker build -t iot-adapter "$(dirname $(readlink -f $0))" --no-cache --network host
