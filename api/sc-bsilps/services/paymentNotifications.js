const Axios = require("axios");
//scbgetToken is function get token from scb api
const send_Notication = async (result) => {
  // const numberString = data.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  // const endOfMonth = moment().endOf("month").format("DD/MM/YYYY");
  const amount = result.amount
    .toString()
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  await Axios.post("https://hyde-notification.artanitech.com/api/message/sendToTopic", {
    message: {
      notification: {
        title: "Payments",
        body: `Bill No. ${result.billPaymentRef1} has been paid from ${result.payerName} amount ${amount} baht.`,
        image: "https://firebasestorage.googleapis.com/v0/b/hyde-heritage-9df6e.appspot.com/o/FCMImages%2FArtboard%201.png?alt=media&token=7c0cd071-9c5e-4db2-888c-57ff20b5ed0b",
      },
      data: {
        title: "Payments",
        body: `Bill No. ${result.billPaymentRef1} has been paid from ${result.payerName} amount ${amount} baht.`,
        billPaymentRef1: result.billPaymentRef1
      },
      topic: "Admins"
    },
  });
}
module.exports = { send_Notication };
