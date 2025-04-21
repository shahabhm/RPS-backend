import {Document, model, Model, Schema} from 'mongoose';
import {Message} from "./Message";

interface IChat extends Document {
    users: Schema.Types.ObjectId[];
}

interface IChatModel extends Model<IChat> {
    createChat(account_ids: string[]): Promise<IChat>;
    getUserChats(account_id: string, unread: boolean): Promise<IChat[]>;
}

const chatSchema = new Schema<IChat>({
    users: [{ type: Schema.Types.ObjectId, ref: 'Account', required: true }]
});


chatSchema.statics.createChat = async function (account_ids: string[]) {
    if (account_ids.length !== 2) {
        throw new Error('INVALID_ARGUMENTS');
    }
    const existingChat = await this.findOne({
        users: { $all: account_ids }
    });
    if (existingChat) {
        return existingChat;
    }
    const newChat = new Chat({ users: account_ids });
    await newChat.save();
    return newChat;
};

chatSchema.statics.getUserChats = async function (account_id: string, unread: boolean) {
    const chats = await Chat.find({
        users: account_id
    }).populate('users', 'name');

    const chatListWithDetails = await Promise.all(chats.map(async (chat) => {
        const otherUser = chat.users[0]._id.toString() === account_id ? chat.users[1] : chat.users[0];
        const unread = await Message.countDocuments({
            chat: chat._id,
            sender: { $ne: account_id },
            seen: false
        });
        const lastMessage = await Message.findOne({ chat: chat._id }).sort('-createdAt');
        return {
            ...chat.toObject(),
            unread,
            user: {
                profile_picture: 'sina.png',
                name: otherUser.name,
            },
            last_message: {
                preview: lastMessage?.text ? lastMessage.text : lastMessage?.image_name? 'تصویر' : 'پیامی وجود ندارد.',
                time: lastMessage?.createdAt ? lastMessage.createdAt : null
            }
        };
    }));
    const sortedChatList = chatListWithDetails.sort((a, b) => {
        return new Date(b.last_message.time) < new Date(a.last_message.time);
    });

    if (unread) return chatListWithDetails.filter(chat => chat.unread > 0);
    return chatListWithDetails;

}

const Chat = model<IChat, IChatModel>('Chat', chatSchema);


export { Chat, IChat };