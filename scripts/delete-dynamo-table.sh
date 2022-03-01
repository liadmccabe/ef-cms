#!/bin/bash

# Deletes the specified dynamo table from the environment

# Usage
#   ./delete-dynamo-table.sh $SOURCE_TABLE

# Arguments
#   - $1 - the table to delete

( ! command -v jq > /dev/null ) && echo "jq must be installed on your machine." && exit 1
[ -z "$1" ] && echo "The table to delete must be provided as the \$1 argument." && exit 1

SOURCE_TABLE=$1

WEST_TABLE_STATUS=$(aws dynamodb delete-table --table-name "${SOURCE_TABLE}" --region us-west-1 | jq -r ".TableDescription.TableStatus")

# if [[ $WEST_TABLE_STATUS != "DELETING" ]] ; then
#   echo "The table ${SOURCE_TABLE} in us-west-1 failed to delete. Its status is: ${WEST_TABLE_STATUS}"
#   exit 1
# fi

aws dynamodb describe-table --table-name "${SOURCE_TABLE}" --region us-west-1
CODE=$?

echo "${SOURCE_TABLE} in region us-west-1 is still being deleted or is already deleted."

while [[ "${CODE}" == "0" ]]
do  
  echo "${SOURCE_TABLE} in region us-west-1 is still being deleted. Waiting for 30 seconds then checking again."
  sleep 30
  aws dynamodb describe-table --table-name "${SOURCE_TABLE}" --region us-west-1
  CODE=$?
done

# EAST_TABLE_STATUS=$(aws dynamodb delete-table --table-name "${SOURCE_TABLE}" --region us-east-1 | jq -r ".TableDescription.TableStatus")

# if [[ $EAST_TABLE_STATUS != "DELETING" ]] ; then
#   echo "The table ${SOURCE_TABLE} in us-east-1 failed to delete."
#   exit 1
# fi

# echo "The table ${SOURCE_TABLE} was either successfully deleted or didn't exist prior to deletion attempt."
