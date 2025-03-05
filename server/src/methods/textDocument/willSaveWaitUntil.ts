import { NotificationMessage } from "../../server";
import { WillSaveTextDocumentParams } from "../../types";

export const willSaveWaitUntil = (message: NotificationMessage) => {
  const params = message.params as WillSaveTextDocumentParams;
};
