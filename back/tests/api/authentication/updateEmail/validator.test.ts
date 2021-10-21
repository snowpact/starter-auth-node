import { updateEmailValidator } from '../../../../src/api/authentication/updateEmail/validator';
import { validatorHelper } from '../../../../src/core/testHelpers';

describe('update email validator', () => {
  const validator = updateEmailValidator;
  const { isValid, getParsedData } = validatorHelper(validator);
  it('should validate proper data', () => {
    const validData = {
      body: {
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        email: 'email@gmail.com',
        password: 'password',
      },
    };

    expect(isValid(validData)).toBe(true);
  });
  it('should be invalid - email bad format', () => {
    const validData = {
      body: {
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        email: 'u',
        password: 'password',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - email should be provided', () => {
    const validData = {
      body: {
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        password: 'password',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - password should be provided', () => {
    const validData = {
      body: {
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        email: 'email@gmail.com',
      },
    };

    expect(isValid(validData)).toBe(false);
    try {
      getParsedData(validData);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should be invalid - token should be provided', () => {
    const validData = {
      body: {
        email: 'email@gmail.com',
        password: 'password',
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
