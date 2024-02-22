export interface SchemaV1 {
  settings: {
    key: string;
    value: any;
  };
  accounts: {
    key: string;
    value: {
      pubkey: string;
      readonly: boolean;
      relays?: string[];
      secKey?: ArrayBuffer;
      iv?: Uint8Array;
      useExtension?: boolean;
    };
  };
  dnsIdentifiers: {
    key: string;
    value: { name: string; domain: string; pubkey: string; relays: string[]; updated: number };
    indexes: { name: string; domain: string; pubkey: string; updated: number };
  };
}
