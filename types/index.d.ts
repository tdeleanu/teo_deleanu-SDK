// /<reference path='./Error.d.ts' />
// /<reference path='./lib.d.ts' />
// /<reference path='./net/net.d.ts' />
// /<reference path='./Character.d.ts' />
// /<reference path='./Movie.d.ts' />
// /<reference path='./Quote.d.ts' />

// Imports: The end of the section generated from our OpenAPI spec

declare module 'lotr' {
  // Added to in other modules, referenced above.
  export namespace LotrSDK {}

  export class Lotr {
    static Lotr: typeof Lotr;

    constructor(apiKey: string, config: LotrSDK.LotrConfig);

    movie: Movie;
    character: Character;
    quote: Quote;

    /**
     * API Errors
     */
    errors: typeof Lotr.errors;

    on(event: 'request', handler: (event: Lotr.RequestEvent) => void): void;
    on(event: 'response', handler: (event: Lotr.ResponseEvent) => void): void;
    once(event: 'request', handler: (event: Lotr.RequestEvent) => void): void;
    once(event: 'response', handler: (event: Lotr.ResponseEvent) => void): void;
    off(event: 'request', handler: (event: Lotr.RequestEvent) => void): void;
    off(event: 'response', handler: (event: Lotr.ResponseEvent) => void): void;
  }

  export default Lotr;
}
