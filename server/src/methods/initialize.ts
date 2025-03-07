interface InitializeResult {
  capabilities: ServerCapabilities;
  serverInfo?: {
    name: string;
    version?: string;
  };
}

interface ServerCapabilities {
  textDocumentSync?: TextDocumentSyncOptions | TextDocumentSyncKind;
  completionProvider?: {};
  definitionProvider?: {};
}

export interface TextDocumentSyncOptions {
  openClose?: boolean;
  change?: TextDocumentSyncKind;
}

export namespace TextDocumentSyncKind {
  export const None = 0;
  export const Full = 1;
  export const Incremental = 2;
}
export type TextDocumentSyncKind = 0 | 1 | 2;

export const initialize = (): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: {
        change: 2, // incremental
        openClose: true,
      },
      completionProvider: {},
      definitionProvider: {},
    },
    serverInfo: {
      name: "laravel-language-server",
      version: "0.0.1",
    },
  };
};
