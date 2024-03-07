//@ts-check

import remember, { forget } from 'remember'

const ACCESS_TOKEN_STORAGE_KEY = 'comptanar_github_access_token'

/**
 *
 * @param {string} [token]
 * @returns {Promise<void | string>}
 */
export function rememberToken(token) {
  //@ts-expect-error it's always a string that's being stored
  return token ? remember(ACCESS_TOKEN_STORAGE_KEY, token) : remember(ACCESS_TOKEN_STORAGE_KEY)
}
export function forgetToken() {
  return forget(ACCESS_TOKEN_STORAGE_KEY)
}
