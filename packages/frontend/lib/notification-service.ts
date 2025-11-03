import axios from 'axios';

export class NotificationService {
    static async sendNotification(message: string) {
        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_GROUP_CHAT_ID) {
            console.log('📢 Test Notification, no token or chat id:', message);
            return;
        }
        await axios
            .post('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
                chat_id: process.env.TELEGRAM_GROUP_CHAT_ID,
                text: message,
            })
            .catch(e => {
                console.error(e);
            });
    }
}
