import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

export { typeDefs } from './schema';
export { resolvers } from './resolvers';
export { LinkedInService } from './services/linkedinService';

export const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
