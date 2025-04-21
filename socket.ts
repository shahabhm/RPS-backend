import {Server, Socket} from "socket.io";
import jwt from "jsonwebtoken";

const usersSocketConnections = new Map<string, string>();
let io: Server;

interface DecodedToken {
    account_id: string;
}

const initializeSocket = (httpServer: any) => {
    io = new Server(httpServer, {
        path: '/api/socket.io',
    });

    // This is a middleware that will be invoked before the connection is established.
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }

        // TODO: fix this. This is not secure.
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded: DecodedToken) => {
            if (err) {
                return next(new Error("Authentication error"));
            }
            socket.data.account_id = decoded.account_id;
            next();
        });
    });

    io.on('connection', (socket: Socket) => {
        const account_id = socket.data.account_id;
        usersSocketConnections.set(account_id, socket.id);
        console.log(`User ${account_id} connected with socket ID ${socket.id}`);

        socket.on('sendMessageToUser', ({ targetUserId, message }: { targetUserId: string, message: string }) => {
            const targetSocketId = usersSocketConnections.get(targetUserId);
            if (targetSocketId) {
                io.to(targetSocketId).emit('receiveMessage', message);
            } else {
                console.log(`User ${targetUserId} is not connected`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${account_id} disconnected`);
            usersSocketConnections.delete(account_id);
        });
    });
};

const sendPush = (account_id: string, channel: string, message: object) => {
    const socketId = usersSocketConnections.get(account_id);
    if (socketId) {
        io.to(socketId).emit(channel, message);
    } else {
        console.log(`User ${account_id} is not connected`);
    }
};

export { initializeSocket, sendPush };