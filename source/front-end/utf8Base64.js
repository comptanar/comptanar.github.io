//@ts-check

// adapted from https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
/**
 *
 * @param {string} s // cleartext string
 * @returns {string} // utf-8-encoded base64 string
 */
export function UTF8ToB64(s) {
  return btoa(unescape(encodeURIComponent(s)));
}

/**
 *
 * @param {string} s // utf-8-encoded base64 string
 * @returns {string} // cleartext string
 */
export function b64ToUTF8(s) {
  return decodeURIComponent(escape(atob(s)));
}
