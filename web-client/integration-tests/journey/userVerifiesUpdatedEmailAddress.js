import { getUserRecordById } from '../helpers';

export const userVerifiesUpdatedEmailAddress = (cerebralTest, user) =>
  it(`${user} verifies updated email address`, async () => {
    const userFromState = cerebralTest.getState('user');
    const userFromPersistence = await getUserRecordById(userFromState.userId);
    const emailVerificationToken =
      userFromPersistence.pendingEmailVerificationToken;

    console.log('userFromState', userFromState);
    console.log('userFromPersistence', userFromPersistence);
    console.log('emailVerificationToken', emailVerificationToken);

    await cerebralTest.runSequence('navigateToPathSequence', {
      path: `/verify-email?token=${emailVerificationToken}`,
    });

    expect(window.location.replace).toHaveBeenCalledWith(
      'http://localhost:5678/email-verification-success',
    );
  });
