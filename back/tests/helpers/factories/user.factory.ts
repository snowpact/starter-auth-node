import faker from 'faker';
import { buildFactory } from '../../../src/core/testHelpers';
import { IUserEntity } from '../../../src/entities/user.entity';

const buildSchema = (): IUserEntity => ({
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  password: faker.lorem.word(),
  blocked: false,
  enabled: true,
});

export const userEntityFactory = (args?: Partial<IUserEntity>): IUserEntity =>
  buildFactory<IUserEntity>({
    ...buildSchema(),
  })(args);
