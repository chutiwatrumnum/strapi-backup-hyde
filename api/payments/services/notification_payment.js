const moment = require("moment");
const axios = require("axios");
const sendNotificationPayment = async (userId, outstanding) => {
  try {
    await axios.post("https://hyde-notification.artanitech.com/api/message/send", {
      userId: `${userId}`,
      message: {
        notification: {
          title: "Outstanding Payment",
          body: `You have an outstanding payment amount of ${outstanding}Baht. Please check the details with Silverman`,
        }
      },
    });
    return true
  } catch (err) {
    console.error(err)
    return false

  }

}

module.exports = { sendNotificationPayment };
