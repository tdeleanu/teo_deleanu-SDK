import {LotrResource} from '../LotrResource.js';
const lotrMethod = LotrResource.method;

export const Quotes = LotrResource.extend({
  list: lotrMethod({
    method: 'GET',
    fullPath: '/v2/quote',
    methodType: 'list',
  }),

  retrieve: lotrMethod({
    method: 'GET',
    fullPath: '/v2/quote/{quote}',
  }),
});
