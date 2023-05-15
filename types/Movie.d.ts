declare module 'lotr' {
  namespace LotrSDK {
    // Define an interface for a Movie.
    // Each field corresponds to a piece of data we expect to receive about a movie.
    interface Movie {
      // The title of the movie.
      title: string;

      // The release date of the movie.
      releaseDate: string;

      // The length of the movie in minutes.
      duration: number;

      // The director of the movie.
      director: string;

      // An array of Character objects representing the main characters in the movie.
      characters: Character[];
    }
  }
}
