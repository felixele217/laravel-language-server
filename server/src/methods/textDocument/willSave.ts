import { NotificationMessage } from "../../server";
import { WillSaveTextDocumentParams } from "../../types";

export const willSave = (message: NotificationMessage) => {
  const params = message.params as WillSaveTextDocumentParams;
};
