import { RefreshValidator } from '../../../../src/api/authentication/refresh/validator';
import { validatorHelper } from '../../../../src/core/testHelpers';

describe('refresh validator', () => {
  const validator = RefreshValidator;
  const { isValid, getParsedData } = validatorHelper(validator);
  it('should validate proper data', () => {
    const validData = {
      body: {
        refreshToken:
          '15ea2b792ca99e24516cfdb09cce9a6a70b5e948a88b96cd2f35b3e85bafee1249200766d5eb81781075ebc46afbd4845b3024ce2a14a22a3cbda23504b59adbe47db3a9546a91db3704a80674b938b054f113454e45fb1e6fa9d1e8606d2803b0e0c9e5570fdc5c50572ac73871ac',
      },
    };

    expect(isValid(validData)).toBe(true);
  });
  it('should be invalid - missing refresh token', () => {
    const validData = {
      body: {},
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
