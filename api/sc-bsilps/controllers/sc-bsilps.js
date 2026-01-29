'use strict';
// const {
//   send_Notication
//   } = require("../services/paymentNoti/silpNoti");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async sentSilpsSCB(ctx) {
        // add data to db
        const data = await strapi.query('sc-bsilps').create(ctx.request.body)
          .then((result) => {
            console.log("log sentSilpsSCB---------",result)
            return {
              status: true,
              data: {
                billPaymentRef1: result.billPaymentRef1,
                payerName: result.payerName,
                amount: result.amount
              },
            };
          })
          .catch((err) => {
            return {
              status: false,
              data: err.toString(),
            };
          });
        if (data.status === true) {
          // get token scb
        //  await send_Notication(data.data);
            ctx.status = 200;
            ctx.body = data.data;
          
        } else {
          ctx.status = 400;
          ctx.body = data.data;
        }
      },
};
