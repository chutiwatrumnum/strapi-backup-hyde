async function storeChat({
  room,
  room_info,
  fixing_info,
  sender_id,
  sender_name,
  sender_role,
  text,
  type,
  time,
}) {
  try {
    const chatInfo = await strapi.query("chat").create({
      room,
      room_info,
      fixing_info,
      sender_id,
      sender_name,
      sender_role,
      text,
      type,
      time,
      users_read: "unread",
    });
    console.log("CHAT chatInfo-->", chatInfo);
    return chatInfo;
  } catch (err) {
    console.log("User couldn't be created. Try again!", err, ">>>");
  }
}

async function getChat(data) {
  console.log("userIdRead", data.userId);
  const resultData = await strapi.query("chat").find({
    room: data.room,
    users_read: "unread",
  });
  if (resultData) {
    resultData.map(async (item) => {
      console.log(
        "resultData",
        item.text,
        item.id,
        item.sender_id,
        item.sender_role,
        item.users_read
      );
      if (
        (item.sender_id !== data.userId, item.sender_role !== data.userRole)
      ) {
        await strapi.query("chat").update(
          { id: item.id },
          {
            users_read: data.userId,
          }
        );
      }
    });
    console.log(resultData);
  }
}

module.exports = {
  storeChat,
  getChat,
};
