import RelayPool from "../classes/relay-pool";

const relayPoolService = new RelayPool();

setInterval(() => {
  if (document.visibilityState === "visible") {
    relayPoolService.reconnectRelays();
    relayPoolService.pruneRelays();
  }
}, 1000 * 15);

// reconnect to relays when window gets focus
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    relayPoolService.reconnectRelays();
  }
});

if (import.meta.env.DEV) {
  // @ts-ignore
  window.relayPoolService = relayPoolService;
}

export default relayPoolService;
