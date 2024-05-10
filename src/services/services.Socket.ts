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


io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  // Handle file upload event
  socket.on('fileUploaded', (data) => {
    console.log("seeing photo added :", data);
    io.emit('fileUploaded', data);
  });

  // Handle file Download event
  socket.on('fileDownloaded', (data) => {
    console.log("seeing photo downloaded:", data);
    const { fileData, ownerId, downloaderId } = data;
    io.to(ownerId).emit('fileDownloadNotification', { fileData, downloaderId });
  });


  socket.on("newUser", (data) => {
    const { username, userId } = data;
    addNewUser(username, userId, socket.id);
    console.log("seeing all user added:", onlineUsers);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected", socket.id);
    removeUser(socket.id);
  });
});

export { app, io, server };
