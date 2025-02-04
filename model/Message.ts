import { Schema, model, Document, Model } from 'mongoose';

interface IMessage extends Document {
    sender: Schema.Types.ObjectId;
    text?: string;
    seen: boolean;
    chat: Schema.Types.ObjectId;
    image_name?: string;
    createdAt: Date;
}

interface IMessageModel extends Model<IMessage> {
    createMessage(sender_id: string, chat_id: string, text: string, image_name: string): Promise<IMessage>;
    getMessages(chat_id: string, account_id: string): Promise<IMessage[]>;
    seenMessage(message_id: string): Promise<string>;
}

const messageSchema = new Schema<IMessage>({
    sender: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    text: { type: String },
    seen: { type: Boolean, required: true, default: false },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    image_name: { type: String },
    createdAt: { type: Date, default: Date.now }
});

messageSchema.statics.createMessage = async function (sender_id, chat_id, text, image_name): Promise<IMessage> {
    if (!image_name && !text) {
        throw new Error('EMPTY_MESSAGE');
    }
    const message = new this({
        sender: sender_id,
        chat: chat_id,
        text: text,
        image_name: image_name
    });
    await message.save();
    return message;
}

messageSchema.statics.getMessages = async function (chat_id: string, account_id: string): Promise<IMessage[]> {
    await this.updateMany(
        { chat: chat_id, sender: { $ne: account_id }, seen: false },
        { $set: { seen: true } }
    );
    const messages = await this.find({ chat: chat_id }).sort('createdAt');
    return messages;
}

messageSchema.statics.seenMessage = async function (message_id: string): Promise<string> {
    await this.updateOne({ _id: message_id }, { seen: true });
    return 'ok';
}

const Message = model<IMessage, IMessageModel>('Message', messageSchema);

export { Message, IMessage };