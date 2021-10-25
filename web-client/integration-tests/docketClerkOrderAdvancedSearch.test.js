import {
  ADVANCED_SEARCH_TABS,
  DATE_RANGE_SEARCH_OPTIONS,
} from '../../shared/src/business/entities/EntityConstants';
import {
  FORMATS,
  calculateISODate,
  createISODateString,
  formatDateString,
} from '../../shared/src/business/utilities/DateHandler';
import { applicationContextForClient as applicationContext } from '../../shared/src/business/test/createTestApplicationContext';
import { docketClerkAddsDocketEntryFromOrder } from './journey/docketClerkAddsDocketEntryFromOrder';
import { docketClerkAddsDocketEntryFromOrderOfDismissal } from './journey/docketClerkAddsDocketEntryFromOrderOfDismissal';
import { docketClerkCreatesAnOrder } from './journey/docketClerkCreatesAnOrder';
import { docketClerkSealsCase } from './journey/docketClerkSealsCase';
import { docketClerkServesDocument } from './journey/docketClerkServesDocument';
import { docketClerkSignsOrder } from './journey/docketClerkSignsOrder';
import {
  loginAs,
  refreshElasticsearchIndex,
  setupTest,
  uploadPetition,
} from './helpers';

const cerebralTest = setupTest();

const { COUNTRY_TYPES, DOCKET_NUMBER_SUFFIXES, SERVICE_INDICATOR_TYPES } =
  applicationContext.getConstants();

const seedData = {
  caseCaption: 'Hanan Al Hroub, Petitioner',
  contactPrimary: {
    address1: '123 Teachers Way',
    city: 'Haifa',
    country: 'Palestine',
    countryType: COUNTRY_TYPES.INTERNATIONAL,
    name: 'Hanan Al Hroub',
    postalCode: '123456',
    serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
  },
  contactSecondary: {},
  docketEntryId: '1f1aa3f7-e2e3-43e6-885d-4ce341588c76',
  docketNumber: '104-20',
  docketNumberSuffix:
    DOCKET_NUMBER_SUFFIXES.DECLARATORY_JUDGEMENTS_FOR_RETIREMENT_PLAN_REVOCATION,
  documentContents:
    'Déjà vu, this is a seed order filed on Apr 13 at 11:01pm ET',
  documentTitle: 'Order of Dismissal and Decision Entered, Judge Buch',
  filingDate: '2020-04-14T03:01:15.215Z',
  signedJudgeName: 'Maurice B. Foley',
};
const signedByJudge = 'Maurice B. Foley';
let caseDetail;

describe('docket clerk order advanced search', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
    cerebralTest.draftOrders = [];
  });

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  describe('performing data entry', () => {
    loginAs(cerebralTest, 'petitioner@example.com');
    it('create case', async () => {
      caseDetail = await uploadPetition(cerebralTest);
      expect(caseDetail).toBeDefined();
      cerebralTest.docketNumber = caseDetail.docketNumber;
    });

    loginAs(cerebralTest, 'docketclerk@example.com');
    docketClerkCreatesAnOrder(cerebralTest, {
      documentTitle: 'Order',
      eventCode: 'O',
      expectedDocumentType: 'Order',
      signedAtFormatted: '01/02/2020',
    });
    docketClerkSignsOrder(cerebralTest, 0);
    docketClerkAddsDocketEntryFromOrder(cerebralTest, 0);
    docketClerkServesDocument(cerebralTest, 0);

    docketClerkCreatesAnOrder(cerebralTest, {
      documentTitle: 'Order of Dismissal',
      eventCode: 'OD',
      expectedDocumentType: 'Order of Dismissal',
    });
    docketClerkSignsOrder(cerebralTest, 1);
    docketClerkAddsDocketEntryFromOrderOfDismissal(cerebralTest, 1);

    docketClerkCreatesAnOrder(cerebralTest, {
      documentTitle: 'Order of Dismissal',
      eventCode: 'OD',
      expectedDocumentType: 'Order of Dismissal',
    });
    docketClerkSignsOrder(cerebralTest, 2);
    docketClerkAddsDocketEntryFromOrderOfDismissal(cerebralTest, 2);
    docketClerkServesDocument(cerebralTest, 2);

    docketClerkCreatesAnOrder(cerebralTest, {
      documentTitle: 'Order of something',
      eventCode: 'O',
      expectedDocumentType: 'Order',
    });
    docketClerkSignsOrder(cerebralTest, 3);
    docketClerkAddsDocketEntryFromOrder(cerebralTest, 3);
    docketClerkServesDocument(cerebralTest, 3);
    docketClerkSealsCase(cerebralTest);
  });

  describe('search form default behavior', () => {
    it('go to advanced order search tab', async () => {
      await refreshElasticsearchIndex();

      await cerebralTest.runSequence('gotoAdvancedSearchSequence');
      cerebralTest.setState('advancedSearchTab', ADVANCED_SEARCH_TABS.ORDER);

      const judges = cerebralTest.getState('legacyAndCurrentJudges');
      expect(judges.length).toBeGreaterThan(0);

      const legacyJudge = judges.find(judge => judge.role === 'legacyJudge');
      expect(legacyJudge).toBeTruthy();

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(cerebralTest.getState('validationErrors')).toEqual({});
    });

    it('clears search fields', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          caseTitleOrPetitioner: caseDetail.caseCaption,
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          docketNumber: caseDetail.docketNumber,
          keyword: 'dismissal',
          startDate: '01/01/2001',
        },
      });

      await cerebralTest.runSequence('clearAdvancedSearchFormSequence', {
        formType: 'orderSearch',
      });

      expect(cerebralTest.getState('advancedSearchForm.orderSearch')).toEqual({
        keyword: '',
      });
    });

    it('clears validation errors when switching tabs', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          startDate: '01/01/3001',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(cerebralTest.getState('alertError')).toEqual({
        messages: [
          'Start date cannot be in the future. Enter valid start date.',
        ],
        title: 'Please correct the following errors:',
      });

      await cerebralTest.runSequence('advancedSearchTabChangeSequence');

      expect(cerebralTest.getState('alertError')).not.toBeDefined();
    });
  });

  describe('search for things that should not be found', () => {
    it('search for a keyword that is not present in any served order', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          keyword: 'osteodontolignikeratic',
          startDate: '01/01/2001',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(cerebralTest.getState('validationErrors')).toEqual({});
      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual([]);
    });

    it('search for a docket number that is not present in any served orders', async () => {
      const docketNumberNoOrders = '999-99';

      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          docketNumber: docketNumberNoOrders,
          keyword: 'dismissal',
          startDate: '01/01/2001',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual([]);
    });

    it('search for a case title that is not present in any served orders', async () => {
      const caseCaptionNoOrders = 'abcdefghijk';

      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          caseTitleOrPetitioner: caseCaptionNoOrders,
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          keyword: 'dismissal',
          startDate: '01/01/2001',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual([]);
    });

    it('search for a date range that does not contain served orders', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          endDate: '01/03/2005',
          keyword: 'dismissal',
          startDate: '01/01/2005',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual([]);
    });

    it('search for a judge that has not signed any served orders', async () => {
      const invalidJudge = 'Judge Exotic';

      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          judge: invalidJudge,
          keyword: 'dismissal',
          startDate: '01/01/2005',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual([]);
    });
  });

  describe('search for things that should be found', () => {
    it('searches for orders without a keyword', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {},
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`)
          .length,
      ).toBeGreaterThanOrEqual(cerebralTest.draftOrders.length);
    });

    it('search for a keyword that is present in served orders', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          keyword: 'dismissal',
          startDate: '01/01/1000',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[2].docketEntryId,
            isSealed: true,
          }),
        ]),
      );
      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[1].docketEntryId,
          }),
        ]),
      );
    });

    it('search for a docket number that is present in served orders', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          docketNumber: caseDetail.docketNumber,
          keyword: 'dismissal',
          startDate: '01/01/1995',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[2].docketEntryId,
          }),
        ]),
      );
      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[1].docketEntryId,
          }),
        ]),
      );
    });

    it('search for a case title that is present in served orders', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          caseTitleOrPetitioner: caseDetail.caseCaption,
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          keyword: 'dismissal',
          startDate: '01/01/1000',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[2].docketEntryId,
          }),
        ]),
      );
      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[1].docketEntryId,
          }),
        ]),
      );
    });

    it('search for a date range that contains served orders', async () => {
      const endDateISO = createISODateString(); // right now
      const endDate = formatDateString(endDateISO, FORMATS.MMDDYYYY);

      const startDateISO = calculateISODate({
        howMuch: -1,
        units: 'months',
      });
      const startDate = formatDateString(startDateISO, FORMATS.MMDDYYYY);

      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          endDate,
          startDate,
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(cerebralTest.getState('alertError')).not.toBeDefined();
      expect(cerebralTest.getState('validationErrors')).toEqual({});
      await refreshElasticsearchIndex();

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[2].docketEntryId,
          }),
        ]),
      );
      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[1].docketEntryId,
          }),
        ]),
      );
    });

    it('search for a judge that has signed served orders', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          judge: signedByJudge,
          startDate: '01/01/1000',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ docketEntryId: seedData.docketEntryId }),
        ]),
      );
      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            docketEntryId: cerebralTest.draftOrders[1].docketEntryId,
          }),
        ]),
      );
    });

    it('includes the number of pages present in each document in the search results', async () => {
      cerebralTest.setState('advancedSearchForm', {
        orderSearch: {
          dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
          keyword: 'Order of Dismissal Entered',
          startDate: '01/01/1000',
        },
      });

      await cerebralTest.runSequence('submitOrderAdvancedSearchSequence');

      expect(
        cerebralTest.getState(`searchResults.${ADVANCED_SEARCH_TABS.ORDER}`),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            numberOfPages: 1,
          }),
        ]),
      );
    });
  });
});
