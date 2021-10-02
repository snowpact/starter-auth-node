import { registerValidator } from '../../../../src/api/authentication/register/validator';
import { validatorHelper } from '../../../../src/core/testHelpers';

describe('register validator', () => {
  const validator = registerValidator;
  const { isValid, getParsedData } = validatorHelper(validator);
  it('should validate proper data', () => {
    const validData = {
      body: {
        email: 'email@gmail.com',
        password: 'Password95',
      },
    };

    expect(isValid(validData)).toBe(true);
  });
  it('should be invalid - email bad format', () => {
    const validData = {
      body: {
        email: 'u',
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
  it('should be invalid - password bad format - less than 8 char', () => {
    const validData = {
      body: {
        email: 'email@gmail.com',
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
        email: 'email@gmail.com',
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
        email: 'email@gmail.com',
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
        email: 'email@gmail.com',
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
  it('should be invalid - email should be provided', () => {
    const validData = {
      body: {
        password: 'p',
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
});
