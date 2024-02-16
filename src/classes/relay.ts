import { Filter, NostrEvent } from "nostr-tools";
import ControlledObservable from "./controlled-observable";
import createDefer, { Deferred } from "./deferred";
import { PersistentSubject } from "./subject";

export type CountResponse = {
  count: number;
  approximate?: boolean;
};

export type IncomingEvent = ["EVENT", string, NostrEvent];
export type IncomingNotice = ["NOTICE", string];
export type IncomingCount = ["COUNT", string, CountResponse];
export type IncomingEOSE = ["EOSE", string];
export type IncomingCommandResult = ["OK", string, boolean] | ["OK", string, boolean, string];
export type IncomingMessage = IncomingEvent | IncomingNotice | IncomingCount | IncomingEOSE | IncomingCommandResult;

export type OutgoingEvent = ["EVENT", NostrEvent];
export type OutgoingRequest = ["REQ", string, ...Filter[]];
export type OutgoingCount = ["COUNT", string, ...Filter[]];
export type OutgoingClose = ["CLOSE", string];
export type OutgoingMessage = OutgoingEvent | OutgoingRequest | OutgoingClose | OutgoingCount;

export enum RelayMode {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  ALL = 1 | 2,
}

export default class Relay {
  url: string;
  ws?: WebSocket;
  status = new PersistentSubject<number>(WebSocket.CLOSED);
  onOpen = new ControlledObservable<Relay>();
  onClose = new ControlledObservable<Relay>();

  onEvent = new ControlledObservable<IncomingEvent>();
  onNotice = new ControlledObservable<IncomingNotice>();
  onCount = new ControlledObservable<IncomingCount>();
  onEOSE = new ControlledObservable<IncomingEOSE>();
  onCommandResult = new ControlledObservable<IncomingCommandResult>();

  private connectionPromises: Deferred<void>[] = [];
  private queue: OutgoingMessage[] = [];

  constructor(url: string) {
    this.url = url;
  }

  open() {
    if (this.okay) return;
    this.ws = new WebSocket(this.url);

    // for local dev, cancel timeout if module reloads
    if (import.meta.hot) {
      import.meta.hot.prune(() => {
        this.ws?.close();
      });
    }

    this.ws.onopen = () => {
      this.onOpen.next(this);
      this.status.next(this.ws!.readyState);

      this.sendQueued();

      for (const p of this.connectionPromises) p.resolve();
      this.connectionPromises = [];
    };
    this.ws.onclose = () => {
      this.onClose.next(this);
      this.status.next(this.ws!.readyState);
    };
    this.ws.onmessage = this.handleMessage.bind(this);
  }
  send(json: OutgoingMessage) {
    if (this.connected) {
      this.ws?.send(JSON.stringify(json));
    } else this.queue.push(json);
  }
  close() {
    this.ws?.close();
  }

  waitForConnection(): Promise<void> {
    if (this.connected) return Promise.resolve();
    const p = createDefer<void>();
    this.connectionPromises.push(p);
    return p;
  }

  private sendQueued() {
    if (this.connected) {
      for (const message of this.queue) {
        this.send(message);
      }
      this.queue = [];
    }
  }

  get okay() {
    return this.connected || this.connecting;
  }
  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  get connecting() {
    return this.ws?.readyState === WebSocket.CONNECTING;
  }
  get closing() {
    return this.ws?.readyState === WebSocket.CLOSING;
  }
  get closed() {
    return this.ws?.readyState === WebSocket.CLOSED;
  }
  get state() {
    return this.ws?.readyState;
  }

  handleMessage(message: MessageEvent<string>) {
    if (!message.data) return;

    try {
      const data: IncomingMessage = JSON.parse(message.data);
      const type = data[0];

      // all messages must have an argument
      if (!data[1]) return;

      switch (type) {
        case "EVENT":
          this.onEvent.next(data);
          break;
        case "NOTICE":
          this.onNotice.next(data);
          break;
        case "COUNT":
          this.onCount.next(data);
          break;
        case "EOSE":
          this.onEOSE.next(data);
          break;
        case "OK":
          this.onCommandResult.next(data);
          break;
      }
    } catch (e) {
      console.log(`Relay: Failed to parse massage from ${this.url}`);
      console.log(message.data, e);
    }
  }
}
