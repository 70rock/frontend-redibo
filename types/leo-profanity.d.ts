declare module 'leo-profanity' {
  export function getDictionary(lang: string): string[]
  export function add(words: string[]): void
  export function clean(text: string): string
  export function check(text: string): boolean
  export function list(): string[]
  export function remove(word: string): void
  export function reset(): void
} 