# Teo Deleanu SDK

The Teo Deleanu SDK is a convenient wrapper around the [LOTR API](https://the-one-api.dev/documentation), designed to simplify working with the API in your Node.js or browser javascript projects. 
This SDK is inspired by the Stripe SDK and follows a similar structure.

## Installation

To install the LOTR SDK, navigate to your project's root folder and run:

```bash
yarn install path-to-your-teo_deleanu-sdk
```
WHERE path-to-your-teo_deleanu-sdk = https://github.com/tdeleanu/teo_deleanu-SDK

Replace `path-to-your-teo_deleanu-sdk` with the correct path to the LOTR SDK folder.

## Usage

Before doing anything first go into the folder and install the library.

You can either install the library from github or from yarn/npm(WIP, not published yet).

To install run these commands:
```bash
git clone https://github.com/tdeleanu/teo_deleanu-SDK
cd teo_deleanu-SDK
npm run build
```
Prerequisites: Node and npm require to be installed. Minimum Node 12.


1. First, import the LOTR SDK and create a new instance by providing your API key:

```javascript
const path = 'teo_deleanu-SDK';
const lotr = require(path)('your_api_key');
```

Replace `path-to-your-teo_deleanu-sdk` with the correct path to the LOTR SDK folder and `your_api_key` with your actual API key.

2. You can now interact with the LOTR API using the SDK's methods. Here's an example showcasing the usage of some of the available methods:

```javascript
try {
  throw new lotr.errors.LotrError({
    charge: 'foo',
    unknown_prop: 'bar',
  });
} catch (e) {
  if (e instanceof lotr.errors.LotrError) {
    console.log("Caught LotrError");
  } else {
    throw e;
  }
}

async function exampleFunction(args) {
  try {
    const movies = await lotr.movies.list();
    console.log(movies);
    const movie = await lotr.movies.retrieve(args.movie);
    console.log(movie);
    const movieQuotes = await lotr.movies.retrieveQuotes(args.movie);
    console.log(movieQuotes);
    //also using autopagination feature
    const quotes = await lotr.quotes.list({page: 2}); 
    console.log(quotes);
    const oneQuote = await lotr.quotes.retrieve(args.quote);
    console.log(oneQuote);
  } catch (e) {
    if (e instanceof lotr.errors.LotrInvalidRequestError) {
      console.log("Caught LotrInvalidRequestError");
    } else {
      throw e;
    }
  }
}

exampleFunction({
    movie: '5cd95395de30eff6ebccde5c',
    quote: '5cd96e05de30eff6ebccee87'
});
```

Replace the `args.movie` and `args.quote` values with valid IDs from the LOTR API.

You can find a complete example in the [testProjects/cjs/index.js](./testProjects/cjs/index.js) file.

## Error Handling

The LOTR SDK provides custom error classes to handle specific error scenarios:

- `LotrError`: A generic error class for all LOTR SDK errors.
- `LotrInvalidRequestError`: An error class for invalid API requests.
- `LotrRateLimitError`: Too many requests to the api
- `LotrAuthenticationError`: An auth error has happened with an invalid JSON received from the Lotr API
- `LotrAPIError`: API level errors

You can catch and handle these errors and handle appropriately in your application as shown in the example above.

## Development

## Development

Run all tests:

```bash
yarn install
yarn test
```

If you do not have `yarn` installed, you can get it with `npm install --global yarn`.


Run a single test suite without a coverage report:

```bash
yarn mocha-only test/Error.spec.ts
```

Run a single test (case sensitive) in watch mode:

```bash
yarn mocha-only test/Error.spec.ts --grep 'Populates with type' --watch
```

If you wish, you may run tests using your Stripe _Test_ API key by setting the
environment variable `THE_ONE_API_TOKEN` before running the tests:

```bash
export THE_ONE_API_TOKEN='your_api_key'
yarn test
```

Run prettier:

Add an [editor integration](https://prettier.io/docs/en/editors.html) or:

```bash
yarn fix
```