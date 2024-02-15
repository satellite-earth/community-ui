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
}
