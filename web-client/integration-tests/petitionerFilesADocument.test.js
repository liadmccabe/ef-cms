import { fakeFile, loginAs, setupTest, uploadPetition } from './helpers';
import { petitionerCancelsCreateCase } from './journey/petitionerCancelsCreateCase';
import { petitionerFilesAmendedMotion } from './journey/petitionerFilesAmendedMotion';
import { petitionerFilesDocumentForCase } from './journey/petitionerFilesDocumentForCase';
import { petitionerViewsCaseDetail } from './journey/petitionerViewsCaseDetail';
import { petitionerViewsCaseDetailAfterFilingDocument } from './journey/petitionerViewsCaseDetailAfterFilingDocument';
import { petitionsClerkServesPetitionFromDocumentView } from './journey/petitionsClerkServesPetitionFromDocumentView';

const cerebralTest = setupTest();

describe('petitioner files document', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  loginAs(cerebralTest, 'petitioner@example.com');
  petitionerCancelsCreateCase(cerebralTest);
  it('login as a petitioner and create a case', async () => {
    const caseDetail = await uploadPetition(cerebralTest, {
      caseType: 'Whistleblower',
    });
    expect(caseDetail.docketNumber).toBeDefined();
    cerebralTest.docketNumber = caseDetail.docketNumber;
  });

  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkServesPetitionFromDocumentView(cerebralTest);

  loginAs(cerebralTest, 'petitioner@example.com');
  petitionerViewsCaseDetail(cerebralTest);
  petitionerFilesDocumentForCase(cerebralTest, fakeFile);
  petitionerViewsCaseDetailAfterFilingDocument(cerebralTest);
  petitionerFilesAmendedMotion(cerebralTest, fakeFile);
});
