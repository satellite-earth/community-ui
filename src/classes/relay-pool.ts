import { logger } from "../helpers/debug";
import { validateRelayURL } from "../helpers/relay";
import Relay from "./relay";
import Subject from "./subject";

export default class RelayPool {
  relays = new Map<string, Relay>();
  onRelayCreated = new Subject<Relay>();

  relayClaims = new Map<string, Set<any>>();

  log = logger.extend("RelayPool");

  getRelays() {
    return Array.from(this.relays.values());
  }
  getRelayClaims(url: string | URL) {
    url = validateRelayURL(url);
    const key = url.toString();
    if (!this.relayClaims.has(key)) {
      this.relayClaims.set(key, new Set());
    }
    return this.relayClaims.get(key) as Set<any>;
  }

  requestRelay(url: string | URL, connect = true) {
    url = validateRelayURL(url);
    const key = url.toString();
    if (!this.relays.has(key)) {
      const newRelay = new Relay(key);
      this.relays.set(key, newRelay);
      this.onRelayCreated.next(newRelay);
    }

    const relay = this.relays.get(key) as Relay;
    if (connect && !relay.okay) {
      try {
        relay.open();
      } catch (e) {
        this.log(`Failed to connect to ${relay.url}`);
        this.log(e);
      }
    }
    return relay;
  }

  pruneRelays() {
    for (const [url, relay] of this.relays.entries()) {
      const claims = this.getRelayClaims(url).size;
      if (claims === 0) {
        relay.close();
      }
    }
  }
  reconnectRelays() {
    for (const [url, relay] of this.relays.entries()) {
      const claims = this.getRelayClaims(url).size;
      if (!relay.okay && claims > 0) {
        try {
          relay.open();
        } catch (e) {
          this.log(`Failed to connect to ${relay.url}`);
          this.log(e);
        }
      }
    }
  }

  addClaim(url: string | URL, id: any) {
    url = validateRelayURL(url);
    const key = url.toString();
    this.getRelayClaims(key).add(id);
  }
  removeClaim(url: string | URL, id: any) {
    url = validateRelayURL(url);
    const key = url.toString();
    this.getRelayClaims(key).delete(id);
  }

  get connectedCount() {
    let count = 0;
    for (const [url, relay] of this.relays.entries()) {
      if (relay.connected) count++;
    }
    return count;
  }
}
