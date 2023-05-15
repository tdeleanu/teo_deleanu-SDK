declare module 'lotr' {
  namespace LotrSDK {
    // Define an interface for a Quote.
    // Each field corresponds to a piece of data we expect to receive about a quote.
    interface Quote {
      // The text of the quote.
      text: string;

      // The character who said the quote.
      character: Character;

      // The movie the quote is from.
      movie: Movie;
    }
  }
}
