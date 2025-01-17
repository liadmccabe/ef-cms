const {
  calculateISODate,
  createISODateAtStartOfDayEST,
} = require('../../../business/utilities/DateHandler');
const { queryFull } = require('../../dynamodbClientService');

exports.getDocumentQCServedForSection = ({ applicationContext, section }) => {
  const startOfDay = createISODateAtStartOfDayEST();
  const afterDate = calculateISODate({
    dateString: startOfDay,
    howMuch: -7,
    units: 'days',
  });

  return queryFull({
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':afterDate': afterDate,
      ':pk': `section-outbox|${section}`,
    },
    KeyConditionExpression: '#pk = :pk AND #sk >= :afterDate',
    applicationContext,
  });
};
