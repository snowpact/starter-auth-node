import { IValidationTokenRepository } from '../../src/repositories/validationToken.repository';

export interface ITokensRepositoryMockOptions {
  getEmailValidationToken?: string;
}

export default (options?: ITokensRepositoryMockOptions): IValidationTokenRepository => ({
  addEmailValidationToken: jest.fn().mockResolvedValue('OK'),
  getEmailValidationToken: jest.fn().mockResolvedValue(options?.getEmailValidationToken),
  deleteEmailValidationToken: jest.fn().mockResolvedValue(1),
});
