#!/bin/bash

ENVIRONMENT=$1

[ -z "${ENVIRONMENT}" ] && echo "You must pass in ENVIRONMENT as a command line argument 1" && exit 1
[ -z "${SOURCE_TABLE}" ] && echo "You must set SOURCE_TABLE as an environment variable" && exit 1
[ -z "${DESTINATION_TABLE}" ] && echo "You set DESTINATION_TABLE as an environment variable" && exit 1

BUCKET="${ZONE_NAME}.terraform.deploys"
KEY="migrations-cron-${ENVIRONMENT}.tfstate"
LOCK_TABLE=efcms-terraform-lock
REGION=us-east-1

tf_version=$(terraform --version)

if [[ ${tf_version} != *"1.0.9"* ]]; then
  echo "Please set your terraform version to 1.0.9 before deploying."
  exit 1
fi

rm -rf .terraform
echo "Initiating provisioning for environment [${ENVIRONMENT}] in AWS region [${REGION}]"
sh ../bin/create-bucket.sh "${BUCKET}" "${KEY}" "${REGION}"

echo "checking for the dynamodb lock table..."
aws dynamodb list-tables --output json --region "${REGION}" --query "contains(TableNames, '${LOCK_TABLE}')" | grep 'true'
result=$?
if [ ${result} -ne 0 ]; then
  echo "dynamodb lock does not exist, creating"
  sh ../bin/create-dynamodb.sh "${LOCK_TABLE}" "${REGION}"
else
  echo "dynamodb lock table already exists"
fi

npm run build:assets

# exit on any failure
set -eo pipefail
npm run build:lambda:migration-cron

# get the stream arn
STREAM_ARN=$(aws dynamodbstreams list-streams --region us-east-1 --query "Streams[?TableName=='${SOURCE_TABLE}'].StreamArn | [0]" --output text)

export TF_VAR_environment=$ENVIRONMENT
export TF_VAR_stream_arn=$STREAM_ARN
export TF_VAR_source_table=$SOURCE_TABLE
export TF_VAR_destination_table=$DESTINATION_TABLE
export TF_VAR_dns_domain=$EFCMS_DOMAIN
export TF_VAR_deploying_color=$DEPLOYING_COLOR
export TF_VAR_circle_workflow_id=$CIRCLE_WORKFLOW_ID
export TF_VAR_migrate_flag=$MIGRATE_FLAG
export TF_VAR_circle_machine_user_token=$CIRCLE_MACHINE_USER_TOKEN

terraform init -backend=true -backend-config=bucket="${BUCKET}" -backend-config=key="${KEY}" -backend-config=dynamodb_table="${LOCK_TABLE}" -backend-config=region="${REGION}"
terraform plan
terraform apply -auto-approve
