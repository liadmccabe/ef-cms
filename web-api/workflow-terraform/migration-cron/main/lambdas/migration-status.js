const {
  approvePendingJob,
} = require('../../../../../shared/admin-tools/circleci/interact-with-pending-job');
const {
  getMetricStatistics,
  getSqsQueueCount,
} = require('../../../../../shared/admin-tools/aws/migrationWaitHelper');

const apiToken = process.env.CIRCLE_MACHINE_USER_TOKEN;
const workflowId = process.env.CIRCLE_WORKFLOW_ID;
const dlQueueUrl = `https://sqs.us-east-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/migration_segments_dl_queue_${process.env.ENVIRONMENT}`;
const workQueueUrl = `https://sqs.us-east-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/migration_segments_queue_${process.env.ENVIRONMENT}`;
const migrateFlag = process.env.MIGRATE_FLAG;

exports.handler = async (input, context) => {
  await getSqsQueueCount(workQueueUrl);
  if (migrateFlag === 'true') {
    console.log(`Migrate flag is ${migrateFlag}`);

    const hasErrors = hasHighPercentageOfSegmentErrors();
    const dlQueueHasItems = (await getSqsQueueCount(dlQueueUrl)) > 0;

    const totalActiveJobs = await getSqsQueueCount(workQueueUrl);
    if (totalActiveJobs > 0 && !hasErrors && !dlQueueHasItems) {
      return context.succeed(
        `There are ${totalActiveJobs} active jobs in the queue.`,
      );
    }
  }

  console.log('Approving CircleCI wait for reindex job');
  await approvePendingJob({ apiToken, workflowId });
};

const hasHighPercentageOfSegmentErrors = async () => {
  const errorResponse = await getMetricStatistics('Errors');
  console.log(errorResponse);
  const invocationResponse = await getMetricStatistics('Invocations');
  console.log(invocationResponse);

  const errorTotal = errorResponse.length;
  const invocationTotal = invocationResponse.length;
  if (errorResponse && invocationResponse) {
    console.log(`There were ${errorTotal} errors in the last 15 minutes.`);
    console.log(
      `There were ${invocationTotal} invocations in the last 15 minutes.`,
    );
    const failurePercentage = (errorTotal * 100) / invocationTotal;
    console.log(
      `There were ${failurePercentage}% errors in the last 15 minutes.`,
    );
    return failurePercentage > 50;
  }
};
