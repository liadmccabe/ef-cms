const { formatNow } = require('../utilities/DateHandler');
const { Stamp } = require('./Stamp');

const { VALIDATION_ERROR_MESSAGES } = Stamp;

describe('Stamp entity', () => {
  describe('Validation', () => {
    it('should be invalid when status is undefined', () => {
      const stamp = new Stamp({});

      expect(stamp.getFormattedValidationErrors()).toMatchObject({
        status: VALIDATION_ERROR_MESSAGES.status,
      });
    });

    it('should be invalid when date is in the past', () => {
      const stamp = new Stamp({
        date: '2019-12-05T00:00:00.000-05:00',
        dueDateMessage: 'something',
        status: 'Granted',
      });

      expect(stamp.getFormattedValidationErrors()).toMatchObject({
        date: 'Due date cannot be prior to today. Enter a valid date.',
      });
    });

    it('should be invalid when date is undefined but dueDateMessage is defined', () => {
      const stamp = new Stamp({
        date: undefined,
        dueDateMessage: 'something',
        status: 'Granted',
      });

      expect(stamp.getFormattedValidationErrors()).toMatchObject({
        date: 'Enter a valid date',
      });
    });

    it('should be valid when date and dueDateMessage are defined', () => {
      const stamp = new Stamp({
        date: '2222-12-05T00:00:00.000-05:00',
        dueDateMessage: 'something',
        status: 'Granted',
      });

      expect(stamp.getFormattedValidationErrors()).toBeNull();
    });

    it('should be valid when date is today', () => {
      const mockToday = formatNow();

      const stamp = new Stamp({
        date: mockToday,
        dueDateMessage: 'something',
        status: 'Granted',
      });

      expect(stamp.getFormattedValidationErrors()).toBeNull();
    });
  });
});
