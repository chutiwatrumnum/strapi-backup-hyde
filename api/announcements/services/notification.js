const Axios = require("axios");
const send_Notication = async () => {
  await Axios.post("https://hyde-notification.artanitech.com/api/message/sendToTopic", {
    message: {
      notification: {
        title: "Announce",
        body: `There is a new announcement for you, Let's check what it is.`,
      },
      data: {
        title: "Announce",
        body: `There is a new announcement for you, Let's check what it is.`,
      },
      topic: "Announce"
    },
  });
}
module.exports = { send_Notication };
