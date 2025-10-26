export function calculateReadingTime(words: number, wpm = 200) {
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return `${minutes} min read`;
}

export function countWordsFromText(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

