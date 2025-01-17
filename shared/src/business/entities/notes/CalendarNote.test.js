const {
  over1000Characters,
} = require('../../test/createTestApplicationContext');
const { CalendarNote } = require('./CalendarNote');

const { VALIDATION_ERROR_MESSAGES } = CalendarNote;

describe('CalendarNote', () => {
  describe('validation', () => {
    it('should have error message for note field longer than 200 characters', () => {
      const entity = new CalendarNote({ note: over1000Characters });
      expect(entity.getFormattedValidationErrors()).toEqual({
        note: VALIDATION_ERROR_MESSAGES.note,
      });
    });

    it('should be valid when all fields are present', () => {
      const entity = new CalendarNote({
        note: '  some notes   ', // with spaces all around it
      });
      expect(entity.getFormattedValidationErrors()).toEqual(null);
      expect(entity.note).toEqual('some notes');
    });

    it('should be valid note if it is an empty string', () => {
      const entity = new CalendarNote({
        note: '',
      });
      expect(entity.getFormattedValidationErrors()).toEqual(null);
      expect(entity.note).toEqual('');
    });
  });
});
