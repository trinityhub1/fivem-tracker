import { storage } from "./storage.js";

const KEY = "favourites";
const MAX_FAVOURITES = 50;

function readAll() {
  const list = storage.get(KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeAll(list) {
  storage.set(KEY, list.slice(0, MAX_FAVOURITES));
}

export const favourites = {
  list() {
    return readAll();
  },

  isFavourite(serverId) {
    return readAll().some((f) => f.id === serverId);
  },

  add(serverId, name) {
    const list = readAll().filter((f) => f.id !== serverId);
    list.unshift({ id: serverId, name: name || serverId, addedAt: Date.now() });
    writeAll(list);
  },

  remove(serverId) {
    writeAll(readAll().filter((f) => f.id !== serverId));
  },

  toggle(serverId, name) {
    if (favourites.isFavourite(serverId)) {
      favourites.remove(serverId);
      return false;
    }
    favourites.add(serverId, name);
    return true;
  },
};
