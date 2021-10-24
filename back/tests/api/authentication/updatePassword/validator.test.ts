import { updatePasswordValidator } from '../../../../src/api/authentication/updatePassword/validator';
import { validatorHelper } from '../../../../src/core/testHelpers';

describe('update password validator', () => {
  const validator = updatePasswordValidator;
  const { isValid, getParsedData } = validatorHelper(validator);
  it('should validate proper data', () => {
    const validData = {
      body: {
        oldPassword: 'Password95',
        newPassword: 'newPassword95',
      },
    };

    expect(isValid(validData)).toBe(true);
  });
  it('should be invalid - old password should be provided', () => {
    const validData = {
      body: {
        newPassword: 'newPassword95',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - password bad format - less than 8 char', () => {
    const validData = {
      body: {
        oldPassword: 'Password95',
        newPassword: 'Passw95',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - password bad format - without number', () => {
    const validData = {
      body: {
        oldPassword: 'Password95',
        newPassword: 'Passwordddd',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - password bad format - without uppercase', () => {
    const validData = {
      body: {
        oldPassword: 'Password95',
        newPassword: 'password95',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - password bad format - without lowercase', () => {
    const validData = {
      body: {
        oldPassword: 'Password95',
        newPassword: 'PASSWORD95',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
