const { getBooking } = require('./booking');
module.exports = {

  "* * * * *": async () => {
    await getBooking();
    await strapi.api.announcements.services.announcements.Announcement_conjob();
    await strapi.api.announcements.services.announcements.Announcement_conjob_Scheduled();
    await strapi.api.announcements.services.announcements.Announcement_conjob_Delete();
    await strapi.api.announcements.services.announcements.Fixing_Conjob_Delete();
    await strapi.api.announcements.services.announcements.Chat_Conjob_Delete();
    await strapi.api.payments.services.payments.GetPaymentDataNoti();
  },

  "0 0 0 * * *": async () => {
    await strapi.api.payments.services.payments.deleteExpDate();
  },
};