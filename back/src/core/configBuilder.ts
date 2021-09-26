function checkRequiredVariables(requiredVariables: string[], config: NodeJS.ProcessEnv): void {
  requiredVariables.forEach((key): void => {
    if (!config[key] || config[key] === '') {
      throw new Error(`${key} env variable is required`);
    }
  });
}

export interface IConfigBuilderOptions<T> {
  requiredVariables?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseFunction: (config: any) => T;
}

/**
 * Function to validate process.env. It checks if proper keys were set and parses data according to passed function
 * @param requiredVariables variables that need to be set in process.env
 * @param requiredVariables function that allows to define how config data should be parsed
 */
export const configBuilder =
  <T>({ requiredVariables, parseFunction }: IConfigBuilderOptions<T>) =>
  (): T => {
    if (requiredVariables) {
      checkRequiredVariables(requiredVariables, process.env);
    }

    return parseFunction(process.env);
  };
