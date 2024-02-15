import { openDB, deleteDB } from "idb";
import { clearDB, deleteDB as nostrIDBDelete } from "nostr-idb";

import { SchemaV1 } from "./schema";
import { logger } from "../../helpers/debug";
import { localDatabase } from "../local-relay";

const log = logger.extend("Database");

const dbName = "satellite-ui-storage";
const version = 1;
const db = await openDB<SchemaV1>(dbName, version, {
  upgrade(db, oldVersion, _newVersion, _transaction, _event) {
    if (oldVersion < 1) {
      db.createObjectStore("settings");
      db.createObjectStore("accounts", { keyPath: "pubkey" });
    }
  },
});

log("Open");

export async function clearCacheData() {
  log("Clearing nostr-idb");
  await clearDB(localDatabase);
  window.location.reload();
}

export async function deleteDatabase() {
  log("Closing");
  db.close();
  log("Deleting");
  await deleteDB(dbName);
  localDatabase.close();
  await nostrIDBDelete();
  window.location.reload();
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.db = db;
}

export default db;
