"use strict";
const { storeChat, getChat } = require("./utils/database");

module.exports = () => {
  var io = require("socket.io")(strapi.server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  io.on("connection", function (socket) {
    console.log(`User Connected: ${socket.id} `);
    socket.on("join", async ({ sender_id, sender_name, room }, callback) => {
      console.log(
        `sender_id, sender_name, room==>${(sender_id, sender_name)} ${room}`
      );
      try {
        socket.join(room);
      } catch (err) {
        console.log("!!Err occurred, Try again!", err);
      }
    });

    socket.on("sendMessage", async (data, callback) => {
      console.log("sendMessage-->", data);
      console.log("room_info-->", data.userData.room);
      try {
        const chat = await storeChat({
          room: data.userData.room,
          room_info: data.userData.room.includes(":")
            ? data.userData.room.split(":")[0]
            : null,
          fixing_info: data.userData.room.includes("!")
            ? data.userData.room.split("!")[0]
            : null,
          sender_id: data.userData.sender_id,
          sender_name: data.userData.sender_name,
          sender_role: data.userData.sender_role,
          text: data.message,
          time: data.time,
          type: data.type,
        });

        console.log("CHAT-->", chat);
        if (chat.id) {
          io.to(data.userData.room).emit("message", {
            chat_id: chat.id,
            room: data.userData.room,
            sender_id: data.userData.sender_id,
            sender_name: data.userData.sender_name,
            sender_role: data.userData.sender_role,
            text: data.message,
            type: data.type,
            time: data.time,
            users_read: chat.users_read,
          });
          io.emit("fetchHistory");
        }
      } catch (err) {
        console.log("err inside catch block", err);
      }
    });

    socket.on("reportStatus", () => {
      io.emit("fetchHistory");
    });

    socket.on("setRead", async (data) => {
      console.log("testXRead-->", data.room, data.userId, data.userRole);
      try {
        if (data.userId) {
          await getChat(data);
          io.to(data.room).emit("fetchHistory", data.room);
        }
      } catch (err) {
        console.log("err inside catch block", err);
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.room).emit("typing", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnect", socket.id);
    });
  });
};
