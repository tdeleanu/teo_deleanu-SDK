'use strict';

const lotr = require('./testUtils.js').getSpyableLotr();
const expect = require('chai').expect;

describe('Movie Resource', () => {
  describe('Get movies and quotes', () => {
    it('Sends the correct request for movies', () => {
      lotr.movies.list();
      expect(lotr.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v2/movie',
        data: {},
        headers: {},
        settings: {},
      });
    });

    it('Sends the correct request for a movie', () => {
      lotr.movies.retrieve('fellowship');
      expect(lotr.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v2/movie/fellowship',
        data: {},
        headers: {},
        settings: {},
      });
    });

    it("Sends the correct request for a specific movie's quotes", () => {
      lotr.movies.retrieveQuotes('fellowship');
      expect(lotr.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v2/movie/fellowship/quote',
        data: {},
        headers: {},
        settings: {},
      });
    });

    it('Sends the correct request for the list of quotes', () => {
      lotr.quotes.list();
      expect(lotr.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v2/quote',
        data: {},
        headers: {},
        settings: {},
      });
    });
    it('Sends the correct request for a specific quote', () => {
      lotr.quotes.retrieve('quote1');
      expect(lotr.LAST_REQUEST).to.deep.equal({
        method: 'GET',
        url: '/v2/quote/quote1',
        data: {},
        headers: {},
        settings: {},
      });
    });
  });
});
