import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4000"],
  },
});

interface Users {
  username: string;
  userId: string;
  socketId: string;
}
let onlineUsers: Users[] = [];

const addNewUser = (username: string, userId: string, socketId: string) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, userId, socketId });
};

const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username: string) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("notify", (data) => {
    console.log("always calling the notify endpoint", data);
  });

  socket.on("newUser", (data) => {
    const { username, userId } = data;
    addNewUser(username, userId, socket.id);
    console.log("seeing all user added:", onlineUsers);
  });

  socket.on("sendNotification", (data) => {
    const { senderName, receiverName, type } = data;
    // const receiver = getUser(receiverName);
    // console.log("reciever......", receiver)
    // io.to(receiver.socketId).emit("getNotification", {
    //   senderName,
    //   type,
    // });
    io.emit("getNotification", { senderName, type });
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected", socket.id);
    removeUser(socket.id);
  });
});

export { app, io, server };
