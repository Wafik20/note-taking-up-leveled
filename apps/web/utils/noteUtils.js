import { format } from 'date-fns';

// Format: MMM DD, YYYY — HH:mm
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'MMM dd, yyyy — HH:mm');
}

// Remove markdown and LaTeX, return first 40 words (or 200 chars)
export function getNoteExcerpt(content, maxWords = 40, maxChars = 200) {
  if (!content) return '';
  // Remove LaTeX ($...$ and $$...$$)
  let text = content.replace(/\${1,2}[^$]+\${1,2}/g, '');
  // Remove markdown (simple)
  text = text
    .replace(/[#*_`>\-\[\]()>~]/g, '') // Remove markdown symbols
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Remove images
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
    .replace(/\n{2,}/g, ' ') // Collapse newlines
    .replace(/\n/g, ' ');
  // Truncate
  let words = text.trim().split(/\s+/);
  let excerpt = words.slice(0, maxWords).join(' ');
  if (excerpt.length > maxChars) excerpt = excerpt.slice(0, maxChars);
  if (words.length > maxWords || text.length > maxChars) excerpt += '…';
  return excerpt;
} 