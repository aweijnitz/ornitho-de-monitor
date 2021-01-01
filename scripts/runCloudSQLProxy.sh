#!/usr/bin/env bash
# See https://cloud.google.com/sql/docs/postgres/quickstart-proxy-test#macos-64-bit
echo "${INSTANCE_CONNECTION_NAME}"
./cloud_sql_proxy -instances="${INSTANCE_CONNECTION_NAME}"=tcp:5432
