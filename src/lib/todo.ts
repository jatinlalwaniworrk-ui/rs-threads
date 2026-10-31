// A value is a placeholder while it is empty or still contains "[TODO".
export const isTodo = (value: unknown): boolean =>
  typeof value !== 'string' || value.trim() === '' || value.includes('[TODO');

export const isSet = (value: unknown): value is string => !isTodo(value);

const TODO_RE = /\[TODO[^\]]*\]/g;

/** Text without its [TODO ...] markers, for titles, meta tags and structured data. */
export const clean = (text: string): string =>
  text.replace(TODO_RE, ' ').replace(/\s{2,}/g, ' ').trim();

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Escaped HTML with every [TODO ...] marker highlighted in yellow. */
export const highlightTodos = (text: string): string =>
  escapeHtml(text).replace(TODO_RE, (m) => `<mark class="todo">${m}</mark>`);

/** Same as highlightTodos, for HTML that is already safe (rendered markdown). */
export const highlightTodosInHtml = (html: string): string =>
  html.replace(TODO_RE, (m) => `<mark class="todo">${m}</mark>`);

/** Replace {name} tokens with values. Unknown tokens stay as they are. */
export const fill = (text: string, vars: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
