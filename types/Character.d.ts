declare module 'lotr' {
  namespace LotrSDK {
    // Define an interface for a character in the movie.
    // This could be expanded with additional fields as needed.
    interface Character {
      // The name of the character.
      name: string;

      // The race of the character (e.g., "Hobbit", "Elf", etc.)
      race: string;
    }
  }
}
