"use strict";
const moment = require("moment");
const Axios = require("axios").default;
const { sendNotificationPayment } = require("./notification_payment");
const {
  scbGetToken,
  getLocalStroage,
  setLocalStroage,
  SCBgenarateCode,
} = require("./SCB/scb.services");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async getTotalBillingPayment() {
    try {
      const data = await strapi.query("payments").model.aggregate([
        {
          $facet: {
            totalStatus: [
              {
                $group: {
                  _id: "$BillsPayment_Status",
                  total: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);
      return {
        status: true,
        data: data,
      };
    } catch (error) {
      return {
        status: false,
        error: error.toString(),
      };
    }
  },
  // _id: { month: { $month: { $toDate: "$Date_table" } } },
  async getBillingPaymentYear() {
    const firstDayOfTheMonth = moment.utc().startOf("year"); //2021-04-01
    const lastDayOfTheMonth = moment.utc().endOf("year"); //2021-04-30
    console.log("firstDayOfTheMonth:", firstDayOfTheMonth);
    console.log("lastDayOfTheMonth:", lastDayOfTheMonth);
    try {
      const data = await strapi.query("payment-data").model.aggregate([
        {
          $facet: {
            totalStatus: [
              // { $match: { Date_table:
              //   {$gte:{$Date_table:firstDayOfTheMonth},
              //   $lt:  {$Date_table:lastDayOfTheMonth}
              //   }
              // } },
              {
                $group: {
                  _id: { $month: { $toDate: "$Date_table" } },
                  total: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);
      return {
        status: true,
        data: data,
      };
    } catch (error) {
      return {
        status: false,
        error: error.toString(),
      };
    }
  },
  async getDataPayment(query) {
    try {
      const data = await strapi.query("payments").model.aggregate([
        //First stage
        { $match: { BillsPayment_Status: "wait for payment" } },

        //Second stage
        { $group: { _id: "$_id", total: { $sum: 1 } } },

        //Third Stage
        //  { $sort : {sort_field: -1 }}
      ]);
      return {
        status: true,
        data: data,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        error: error.toString(),
      };
    }
  },

  async SCBservices(params) {
    const { total, BillsPayment_Invoice } = params;
    try {
      const localToken = await getLocalStroage("scbtoken");
      if (localToken.status === true) {
        const result = await SCBgenarateCode(
          localToken.data,
          total,
          BillsPayment_Invoice
        );
        // console.log("result+++++++",result)
        console.log("result data status code check error", result, localToken);
        if (result.status === true) {
          // console.log("SCBgenarateCode", result.status);
          return {
            ...result,
          };
        } else if (result.status === false) {
          const resultToken = await scbGetToken();
          if (resultToken.status === true) {
            await setLocalStroage("scbtoken", resultToken.data);
            const resultQR = await SCBgenarateCode(
              resultToken.data,
              total,
              BillsPayment_Invoice
            );
            if (resultQR.status === true) {
              console.log("SCBgenarateCode2", resultQR.status);
              return {
                ...resultQR,
              };
            } else {
              // console.log("resultQRup------",resultQR)
              return {
                status: false,
                data: resultQR.data,
              };
            }
          } else {
            return {
              status: false,
              data: resultToken.massage,
            };
          }
        } else {
          return {
            status: false,
            data: result.data,
          };
        }
      } else {
        const resultToken = await scbGetToken();
        if (resultToken.status === true) {
          await setLocalStroage("scbtoken", resultToken.data);
          const resultQR = await SCBgenarateCode(
            resultToken.data,
            total,
            BillsPayment_Invoice
          );
          if (resultQR.status === true) {
            console.log("SCBgenarateCode3", resultQR.status);
            return {
              ...resultQR,
            };
          } else {
            // console.log("resultQR----",resultQR)
            return {
              status: false,
              data: resultQR.data,
            };
          }
        } else {
          return {
            status: false,
            data: resultToken.massage,
          };
        }
      }
    } catch (error) {
      return {
        status: false,
        data: error.toString(),
      };
    }
  },

  async Payment_outdate() {
    console.log("evertihing out date 1 day");
    const resultData = await strapi
      .query("payments")
      .find({ BillsPayment_Status: "Wait for payment" });
    // console.log("data payments:", resultData);
    // update published_at of articles
    await Promise.all(
      resultData.map(async (e) => {
        let diff = moment().diff(e.BillsPayment_Date_End, "days");
        console.log(
          "out date e.BillsPayment_Date_End:",
          e.BillsPayment_Date_End
        );
        console.log("out date diff:", diff);
        console.log("out date  string:", diff.toString().indexOf("-"));
        if (diff > 0) {
          // if (diff.toString().indexOf("-") < -1) {
          await strapi.api.payments.services.payments.update(
            { id: e.id },
            { BillsPayment_Status: "Out Date" }
          );
          const dataAddress = await strapi
            .query("addresses")
            .findOne({ id: e.address_id });
          await await strapi.services.payments.send_Notication_Outdate(
            dataAddress.owner.id,
            e.Total_BillsPayment,
            e.BillsPayment_Invoice,
            0
          );
        }
        switch (diff) {
          case -5:
            const dataAddress7day = await strapi.query("addresses").findOne({ id: e.address_id });
            await await strapi.services.payments.send_Notication_Outdate(dataAddress7day.owner.id, e.Total_BillsPayment, 7);
            break;

          case -2:
            const dataAddress3day = await strapi.query("addresses").findOne({ id: e.address_id });
            await await strapi.services.payments.send_Notication_Outdate(dataAddress3day.owner.id, e.Total_BillsPayment, 3);
            break;

          default:
            break;
        }
      })
    );
  },

  async Payment_cut_bills() {
    console.log("evertihing end month");
    const resultData = await strapi
      .query("addresses")
      .find({ Status_billpayment: false });
    //  console.log("data address:", resultData);
    // update published_at of articles
    await Promise.all(
      resultData.map(async (e) => {
        await strapi.api.addresses.services.addresses.update(
          { id: e.id },
          { Status_billpayment: true }
        );
      })
    );
  },

  async Payment_Create_Dashboard(params, id, data) {
    let dataUpdate = {
      Amount_water: 0,
      Amount_common_fee: 0,
      Overdue: 0,
      Count_Bills_Date: 0,
    };
    if (id === 1) {
      let dataUpdate = {
        Amount_water: data.Amount_water,
        Amount_common_fee: data.Amount_common_fee,
        Overdue: data.Overdue,
        Count_Bills_Date: data.Count_Bills_Date + 1,
      };
      console.log("overdue:", data.Overdue);
      const { BillsPayment_AllType, Total_BillsPayment } = params.data;
      BillsPayment_AllType.map((e) => {
        console.log("amount:", e.amount);
        console.log("Amount_water:", data.Amount_water);
        console.log("Amount_common_fee:", data.Amount_common_fee);
        console.log("Overdue:", data.Overdue);
        if (e.subBilling === "Water bill") {
          if (e.amount !== undefined && e.amount !== "" && e.amount !== null) {
            dataUpdate.Amount_water = data.Amount_water + parseFloat(e.amount);
          }
        }
        if (e.subBilling === "Common fee") {
          if (e.amount !== undefined && e.amount !== "" && e.amount !== null) {
            dataUpdate.Amount_common_fee =
              data.Amount_common_fee + parseFloat(e.amount);
          }
        }
        if (e.subBilling === "Overdue") {
          if (e.amount !== undefined && e.amount !== "" && e.amount !== null) {
            dataUpdate.Overdue = data.Overdue + parseFloat(e.amount);
          }
        }
      });
      dataUpdate.Total_BillsPayment_Dashboard =
        data.Total_BillsPayment_Dashboard + Total_BillsPayment;
      await strapi
        .query("payment-data")
        .update({ Date_table: data.Date_table }, dataUpdate);
    } else {
      const { BillsPayment_AllType, Total_BillsPayment } = params.data;
      BillsPayment_AllType.map((e) => {
        console.log("BillsPayment_AllType:", typeof e.amount);
        if (e.subBilling === "Water bill") {
          dataUpdate.Amount_water = parseFloat(e.amount);
        }
        console.log("ff:", parseFloat(e.amount), dataUpdate.Amount_water);
        if (e.subBilling === "Common fee") {
          dataUpdate.Amount_common_fee = parseFloat(e.amount);
        }
        if (e.subBilling === "Overdue") {
          dataUpdate.Overdue = parseFloat(e.amount);
        }
      });
      dataUpdate.Date_table = moment().format("YYYY-MM-DD");
      dataUpdate.Total_BillsPayment_Dashboard = Total_BillsPayment;
      dataUpdate.Count_Bills_Date = 1;
      await strapi.query("payment-data").create(dataUpdate);
      console.log("allData:", dataUpdate);
    }
  },

  async send_Notication_Create(userId, data, type) {
    console.log("update-----------------------------", userId, type, data)
    switch (type) {
      case 0:
        console.log("case 0 start")
        const numberString = data
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        const endOfMonth = moment().endOf("month").format("DD/MM/YYYY");
        await Axios.post("https://hyde-notification.artanitech.com/api/message/send", {
          userId: `${userId}`,
          message: {
            notification: {
              title: "Payments",
              body: `You have bills to pay this month in the amount of ${numberString} baht. Please pay before ${endOfMonth}.`,
            },
            data: {
              title: "Payments",
              body: `You have bills to pay this month in the amount of ${numberString} baht. Please pay before ${endOfMonth}.`,
            },
          },
        }).then((res) => {
          console.log("data res notitcation:", res)
        }).catch((err) => {
          console.error("err noticaotn:", err)
        })
        break;

      case 1:
        console.log("case 1 start")
        await Axios.post("https://hyde-notification.artanitech.com/api/message/send", {
          userId: `${userId}`,
          message: {
            notification: {
              title: "Payments",
              body: `You Bills No. ${data} Payment is successful.`,
            },
            data: {
              title: "Payments",
              body: `You Bills No. ${data} Payment is successful.`,
            },
          },
        });
        break;

      case 2:
        await Axios.post("https://hyde-notification.artanitech.com/api/message/send", {
          userId: `${userId}`,
          message: {
            notification: {
              title: "Payments",
              body: `You bill No. ${data.BillsPayment_Invoice} ${data.annotation_payment}`,
            },
            data: {
              title: "Payments",
              body: `You bill No. ${data.BillsPayment_Invoice} ${data.annotation_payment}`,
            },
          },
        });
        break;

      default:
        break;
    }
  },

  async send_Notication_Outdate(userId, data, type, BillsPayment_Invoice) {
    console.log('data=========', userId, data, type, BillsPayment_Invoice)
    const numberString = data
      .toString()
      .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    const endOfMonth = moment().endOf("month").format("DD/MM/YYYY");
    switch (type) {
      case 0:
        await Axios.post("https://hyde-notification.artanitech.com/api/message/send", {
          userId: `${userId}`,
          message: {
            notification: {
              title: "Payments",
              body: `amount ${numberString} baht. Expires ${endOfMonth}.`,
            },
            data: {
              title: "Payments",
              body: `amount ${numberString} baht. Expires ${endOfMonth}.`,
            },
          },
        });
        break;

      case 3:
        await Axios.post("https://hyde-notification.artanitech.com/api/message/send", {
          userId: `${userId}`,
          message: {
            notification: {
              title: "Payments",
              body: `You bill No. ${numberString} (will expire in 3 days.) Please pay before ${endOfMonth}.`,
            },
            data: {
              title: "Payments",
              body: `You bill No. ${numberString} (will expire in 3 days.) Please pay before ${endOfMonth}.`,
            },
          },
        });
        break;

      case 7:
        await Axios.post("https://hyde-notification.artanitech.com/api/message/send", {
          userId: `${userId}`,
          message: {
            notification: {
              title: "Payments",
              body: `You bill No. ${numberString} (will expire in 7 days.) Please pay before ${endOfMonth}.`,
            },
            data: {
              title: "Payments",
              body: `You bill No. ${numberString} (will expire in 7 days.) Please pay before ${endOfMonth}.`,
            },
          },
        });
        break;
      default:
        break;
    }
  },

  async GetPaymentDataNoti() {
    const resultData = await strapi
      .query("payment-import-data")
      .find({ Noti_Status: false });
    await Promise.all(
      resultData.map(async (e) => {
        const result = await strapi.api.payments.services.payments.GetPaymentDataAddress(e.address)
        if (result.status) {
          const status = await sendNotificationPayment(result.data, e.outstanding)
          if (status) {
            console.log('e===========', e)
            await strapi.query("payment-import-data").update({ id: e.id }, { Noti_Status: true })
          }
        }
      })
    );
  },

  async GetPaymentDataAddress(addressesID) {
    const resultData = await strapi
      .query("addresses")
      .find({ address_number: addressesID });
    // console.log('UserID', addressesID)
    // console.log('resultData======', resultData)
    if (resultData.length > 0) {
      return {
        status: true,
        data: resultData[0].owner._id
      }
    } else { return { status: false } }

  },
};
