interface StorageItem<T> {
  data: T;
  expiration: number | null;
}

/**
 * Store data in the given storage with an optional expiration timeout
 * @param storage - The Storage object (localStorage or sessionStorage)
 * @param key - The key to store the data under
 * @param data - The data to store
 * @param timeout - Optional timeout in seconds
 */
function store<T>(
  storage: Storage,
  key: string,
  data: T,
  timeout: number | null = null
): void {
  const expiration = timeout ? Date.now() + timeout * 1000 : null;
  storage.setItem(key, JSON.stringify({ data, expiration }));
}

/**
 * Retrieve data from the given storage, checking expiration
 * @param storage - The Storage object (localStorage or sessionStorage)
 * @param key - The key to retrieve the data from
 * @param defaultValue - The default value to return if data is not found or expired
 * @returns The stored data or the default value
 */
function retrieve<T>(
  storage: Storage,
  key: string,
  defaultValue: T | null = null
): T | null {
  try {
    const itemString = storage.getItem(key);
    if (!itemString) {
      return defaultValue;
    }

    const item: StorageItem<T> = JSON.parse(itemString);
    const expired = item.expiration !== null && item.expiration < Date.now();

    if (expired) {
      storage.removeItem(key);
      return defaultValue;
    }

    return item.data || defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

/**
 * Store data in localStorage with optional expiration
 * @param key - The key to store the data under
 * @param data - The data to store
 * @param timeout - Optional timeout in seconds
 */
export function localStore<T>(
  key: string,
  data: T,
  timeout: number | null = null
): void {
  store(localStorage, key, data, timeout);
}

/**
 * Retrieve data from localStorage
 * @param key - The key to retrieve the data from
 * @param defaultValue - The default value to return if data is not found or expired
 * @returns The stored data or the default value
 */
export function localRetrieve<T>(
  key: string,
  defaultValue: T | null = null
): T | null {
  return retrieve(localStorage, key, defaultValue);
}
