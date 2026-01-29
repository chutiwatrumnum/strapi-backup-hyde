"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const { send_Notication } = require("./notification");
const moment = require("moment");
module.exports = {
  async Announcement_conjob() {
    const resultData = await strapi
      .query("announcements")
      .find({ post_status: "Published" });
    await Promise.all(
      resultData.map(async (e) => {
        let diff = moment().diff(e.date_expired, "DD/MM/YYYY HH:mm:ss");
        // console.log("Announcement_conjob 1 m:", diff.toString().indexOf("-"));
        if (diff.toString().indexOf("-") < 0) {
          await strapi.api.announcements.services.announcements.update(
            { id: e.id },
            { Status_announcements: false }
          );
        }
      })
    );
  },

  async Announcement_conjob_Scheduled() {
    const resultData = await strapi
      .query("announcements")
      .find({ post_status: "Scheduled" });
    if (resultData.length > 0) {
      await Promise.all(
        resultData.map(async (e) => {
          let diff = moment().diff(e.date_expired, "DD/MM/YYYY HH:mm:ss");
          let diffstrat = moment().diff(e.date_announced, "DD/MM/YYYY HH:mm:ss");
          // console.log(
          //   "Announcement conjob Scheduled Expire 1 m:",
          //   diff.toString().indexOf("-")
          // );
          // console.log(
          //   "Announcement conjob Scheduled Start 1 m:",
          //   diffstrat.toString().indexOf("-")
          // );
          if (
            diffstrat.toString().indexOf("-") < 0 &&
            diff.toString().indexOf("-") >= 0
          ) {
            await strapi.api.announcements.services.announcements.update(
              { id: e.id },
              { Status_announcements: true }
            );
            if (e.Status_announcements_noti === false) {
              await send_Notication();
              await strapi.api.announcements.services.announcements.update(
                { id: e.id },
                { Status_announcements_noti: true }
              );
            }
          } else {
            await strapi.api.announcements.services.announcements.update(
              { id: e.id },
              { Status_announcements: false }
            );
          }
        })
      );
    }
  },

  async Announcement_conjob_Delete() {
    const resultData = await strapi.query("announcements").find();
    await Promise.all(
      resultData.map(async (e) => {
        let diffDay = moment().diff(e.date_expired, "DD/MM/YYYY HH:mm:ss");
        let expired = diffDay / 86400000;
        // console.log(
        //   "Announcement conjob Expire 30 day:",
        //   e.title_name,
        //   expired
        // );
        if (expired >= 30) {
          await strapi.api.announcements.services.announcements.delete({
            id: e.id,
          });
          const file = await strapi.plugins["upload"].services.upload.fetch({
            id: e.image.id,
          });
          // console.log(file);
          await strapi.plugins["upload"].services.upload.remove(file);
        }
      })
    );
  },

  async Fixing_Conjob_Delete() {
    const resultData = await strapi
      .query("fixing-reports")
      .find({ status: "Success" });
    if (resultData.length>0) {
      await Promise.all(
        resultData.map(async (e) => {
          let diffDay = moment().diff(e.closing_date, "DD/MM/YYYY HH:mm:ss");
          let expired = diffDay / 86400000;
          console.log("Fixing Expire 30 day:", e.problem, e.id, expired);
          if (expired >= 30) {
            // console.log(e.image_pending)
            // console.log(e.image_repairing)
            // console.log(e.image_success)
            if (e.image_pending.length>0) {
              e.image_pending.map(async (item, index) => {
                console.log("image_pending", index, item.id);
                let file = await strapi.plugins["upload"].services.upload.fetch({
                  id: item.id,
                });
                await strapi.plugins["upload"].services.upload.remove(file);
              });
            }
            if (e.image_repairing.length > 0) {
              e.image_repairing.map(async (item, index) => {
                console.log("image_repairing", index, item.id);
                let file = await strapi.plugins["upload"].services.upload.fetch({
                  id: item.id,
                });
                await strapi.plugins["upload"].services.upload.remove(file);
              });
            }
            if (e.image_success.length > 0) {
              e.image_success.map(async (item, index) => {
                console.log("image_success", index, item.id);
                let file = await strapi.plugins["upload"].services.upload.fetch({
                  id: item.id,
                });
                await strapi.plugins["upload"].services.upload.remove(file);
              });
            }
            await strapi.query("fixing-reports").delete({ id: e.id });
          }
        })
      );
    }

  },

  async Chat_Conjob_Delete() {
    const resultData = await strapi.query("chat").find();
    if (resultData.length > 0) {
      await Promise.all(
        resultData.map(async (e) => {
          let diffDay = moment().diff(e.time, "DD/MM/YYYY HH:mm:ss");
          let expired = diffDay / 86400000;
          console.log("Chat Expire 30 day:", e.text, e.type, expired);
          if (expired >= 30) {
            if (e.type !== "chat") {
              let fileUrl = await strapi.plugins["upload"].services.upload.fetch({
                url: e.text,
              });
              console.log("file", fileUrl.id);
              let file = await strapi.plugins["upload"].services.upload.fetch({
                id: fileUrl.id,
              });
              await strapi.plugins["upload"].services.upload.remove(file);
            }
            await strapi.query("chat").delete({ id: e.id });
          }
        })
      );
    }
  },
};
