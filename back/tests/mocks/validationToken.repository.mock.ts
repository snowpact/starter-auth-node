import { IValidationTokenRepository } from '../../src/repositories/validationToken.repository';

export interface ITokensRepositoryMockOptions {
  getEmailValidationToken?: string;
  getEmailUpdateToken?: string;
}

export default (options?: ITokensRepositoryMockOptions): IValidationTokenRepository => ({
  addEmailValidationToken: jest.fn().mockResolvedValue('OK'),
  getEmailValidationToken: jest.fn().mockResolvedValue(options?.getEmailValidationToken),
  deleteEmailValidationToken: jest.fn().mockResolvedValue(1),
  addEmailUpdateToken: jest.fn().mockResolvedValue('OK'),
  getEmailUpdateToken: jest.fn().mockResolvedValue(options?.getEmailUpdateToken),
  deleteEmailUpdateToken: jest.fn().mockResolvedValue(1),
});
