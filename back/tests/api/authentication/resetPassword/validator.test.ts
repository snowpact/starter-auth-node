import { resetPasswordValidator } from '../../../../src/api/authentication/resetPassword/validator';
import { validatorHelper } from '../../../../src/core/testHelpers';

describe('reset password validator', () => {
  const validator = resetPasswordValidator;
  const { isValid, getParsedData } = validatorHelper(validator);
  it('should validate proper data', () => {
    const validData = {
      body: {
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        password: 'Password95',
      },
    };

    expect(isValid(validData)).toBe(true);
  });
  it('should be invalid - token bad format', () => {
    const validData = {
      body: {
        token: '710032dc',
        password: 'Password95',
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
        password: 'Password95',
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
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        password: 'Passw95',
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
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        password: 'Passwordddd',
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
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        password: 'password95',
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
        token: '710032dc-c7ef-4f63-b8d2-f9f7aeb76cdc',
        password: 'PASSWORD95',
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
