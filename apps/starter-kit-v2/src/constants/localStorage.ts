/**
 * Event name to be used when emitting event to indicate that localStorage has
 * been modified.
 */
export const LOCAL_STORAGE_EVENT = 'local-storage'

/**
 * Key to be used when setting localStorage to indicate that the user is logged in
 * This key is solely used to decide what pages to render on the client side.
 * There should still be a server side check to ensure that the user is logged in before
 * rendering any pages.
 */
export const LOGGED_IN_KEY = 'is-logged-in'
