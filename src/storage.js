function store(storage, key, data) {
  storage.setItem(key, JSON.stringify({data}));
}

function retrieve(storage, key, data = null) {
  try {
    const item = JSON.parse(storage.getItem(key));
    return item.data || data;
  } catch (err) {
    return data;
  }
}

export function localStore(key, data) {
  store(localStorage, key, data);
}

export function localRetrieve(key, data = null) {
  return retrieve(localStorage, key, data);
}
