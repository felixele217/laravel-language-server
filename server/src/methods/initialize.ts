import { RequestMessage } from "../server";

type ServerCapabilities = Record<string, unknown>;

interface InitializeResult {
  capabilities: ServerCapabilities;
  serverInfo?: {
    name: string;
    version?: string;
  };
}

export const initialize = (message: RequestMessage): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: {
        save: { includeText: true },
        change: 2, // incremental
        openClose: true,
        willSave: true,
        willSaveWaitUntil: false,
      },
      completionProvider: {
        resolveProvider: false, // Add this
        triggerCharacters: [">"], // Add this
      },
      definitionProvider: {},
    },
    serverInfo: {
      name: "laravel-language-server",
      version: "0.0.1",
    },
  };
};
