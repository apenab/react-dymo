function store(storage, key, data, timeout = null) {
  const expiration = timeout && moment().add(timeout, "seconds").format();
  storage.setItem(key, JSON.stringify({data, expiration}));
}

function retrieve(storage, key, data = null) {
  try {
    const item = JSON.parse(storage.getItem(key)),
      expired = !!item.expiration && moment(item.expiration) < moment();
    if (expired) {
      storage.removeItem(key);
      return data;
    }
    return item.data || data;
  } catch (err) {
    return data;
  }
}

export function localStore(key, data, timeout = null) {
  store(localStorage, key, data, timeout);
}

export function localRetrieve(key, data = null) {
  return retrieve(localStorage, key, data);
}
