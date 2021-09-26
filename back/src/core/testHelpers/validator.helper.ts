/* eslint-disable @typescript-eslint/no-explicit-any */

import Joi, { ValidationResult } from '@hapi/joi';
import { IRequestValidatorSchema } from '../middlewares';

export interface IValidatorHelper {
  isValid: (args: any) => boolean;
  getParsedData: (args: any) => any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useValidator(schema: IRequestValidatorSchema, args: any): ValidationResult {
  return Joi.object({ ...schema }).validate(args);
}

/**
 * Helper for testing joi validator schemas
 * @param schema object validator schema
 */
export function validatorHelper(schema: IRequestValidatorSchema): IValidatorHelper {
  return {
    isValid: (args): boolean => useValidator(schema, args).error === undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getParsedData: (args): any => {
      const { value, error } = useValidator(schema, args);
      if (error) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    },
  };
}
