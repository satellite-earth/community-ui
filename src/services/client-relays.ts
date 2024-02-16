import { RelayMode } from "../classes/relay";
import { PersistentSubject } from "../classes/subject";
import { logger } from "../helpers/debug";
import { safeRelayUrls } from "../helpers/relay";
import RelaySet from "../classes/relay-set";

class ClientRelayService {
  readRelays = new PersistentSubject(new RelaySet(safeRelayUrls(["wss://nostrue.com"])));
  writeRelays = new PersistentSubject(new RelaySet(safeRelayUrls(["wss://nostrue.com"])));

  log = logger.extend("ClientRelays");

  constructor() {
    const cachedRead = localStorage.getItem("read-relays")?.split(",");
    if (cachedRead) this.readRelays.next(RelaySet.from(cachedRead));

    const cachedWrite = localStorage.getItem("write-relays")?.split(",");
    if (cachedWrite) this.writeRelays.next(RelaySet.from(cachedWrite));
  }

  addRelay(url: string, mode: RelayMode) {
    if (mode & RelayMode.WRITE && !this.writeRelays.value.has(url))
      this.writeRelays.next(this.writeRelays.value.clone().add(url));

    if (mode & RelayMode.READ && !this.readRelays.value.has(url))
      this.readRelays.next(this.readRelays.value.clone().add(url));

    this.saveRelays();
  }
  removeRelay(url: string, mode: RelayMode) {
    if (mode & RelayMode.WRITE) {
      const next = this.writeRelays.value.clone();
      next.delete(url);
      this.writeRelays.next(next);
    }
    if (mode & RelayMode.READ) {
      const next = this.readRelays.value.clone();
      next.delete(url);
      this.readRelays.next(next);
    }

    this.saveRelays();
  }

  saveRelays() {
    localStorage.setItem("read-relays", this.readRelays.value.urls.join(","));
    localStorage.setItem("write-relays", this.writeRelays.value.urls.join(","));
  }
}

const clientRelaysService = new ClientRelayService();

if (import.meta.env.DEV) {
  // @ts-ignore
  window.clientRelaysService = clientRelaysService;
}

export default clientRelaysService;
