import {LotrResource} from '../LotrResource.js';
const lotrMethod = LotrResource.method;

export const Movies = LotrResource.extend({
  list: lotrMethod({
    method: 'GET',
    fullPath: '/v2/movie',
    methodType: 'list',
  }),

  retrieve: lotrMethod({
    method: 'GET',
    fullPath: '/v2/movie/{movie}',
  }),

  retrieveQuotes: lotrMethod({
    method: 'GET',
    fullPath: '/v2/movie/{movie}/quote',
  }),
});
