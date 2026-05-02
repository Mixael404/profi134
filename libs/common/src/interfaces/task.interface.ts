export interface TelegramTask {
  id: string;
  type: 'notification_send';
  payload: { chatId: string; message: string };
  createdAt: string;
}
