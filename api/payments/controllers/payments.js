"use strict";
const moment = require("moment");
const {setlocal,getlocal}= require("../services/SCB/scb.services");
const dataUpdate = null

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async reportBillingPayment(ctx, next) {
    // called by GET /hello
    const data = await strapi.services.payments.getTotalBillingPayment();
    // console.log("ctx=",ctx.params);
    ctx.status = 200;
    ctx.body = data; // we could also send a JSON
  },
  async filterDataPayment(ctx, next) {
    // const data = await strapi.services.payments.getTotalBillingPayment()
    let queyString = null;
    const [filterData] = ctx.request.body.filter;
    console.log("filterData=", process.env.PORT);
    // if (filterData.BillsPayment_Status!== undefined) {
    //   queyString+=`"{BillsPayment_Status:"${filterData.BillsPayment_Status}"}"`
    // }
    // if (filterData.Total_BillsPayment!== undefined) {
    //   queyString+=`"{Total_BillsPayment:"${filterData.Total_BillsPayment}"}"`
    // }
    // if (filterData.BillsPayment_Status!== undefined) {
    //   queyString+=`"{BillsPayment_Status:"${filterData.BillsPayment_Status}"}"`
    // }
    // if (filterData.BillsPayment_Status!== undefined) {
    //   queyString+=`"{BillsPayment_Status:"${filterData.BillsPayment_Status}"}"`
    // }
    // if (filterData.BillsPayment_Status!== undefined) {
    //   queyString+=`"{BillsPayment_Status:"${filterData.BillsPayment_Status}"}"`
    // }
    // if (filterData.BillsPayment_Status!== undefined) {
    //   queyString+=`"{BillsPayment_Status:"${filterData.BillsPayment_Status}"}"`
    // }
    // if (queyString !== null) {
    //   const result =await strapi.services.payments.getDataPayment(queyString)
    //   if (result.status=== true) {
    //     ctx.status=200
    //     ctx.body=result.data
    //   } else {
    //     ctx.status=500
    //     ctx.body=result.error
    //   }
    // }else{
    //   ctx.status=400
    //     ctx.body="errror getDataPayment"
    // }
    // ctx.status = 200
    // ctx.body = "filterDataPayment"; // we could also send a JSON
  },

async updatePayment(ctx){
ctx.status = 200;
const resultUpdateData=  await strapi.query('payments').update({id: ctx.params.id}, { BillsPayment_Status: 'Payment successful' }
).then((respon) => {
    return {
      status: true,
      data: respon
    };
  })
  .catch((err) => {
    console.log("payment to SCB-----",err)
    return {
      status: false,
      data: err.toString(),
    };
  });
  if(resultUpdateData.status === true){
    const Payment_data =  await strapi.query('payment-data').findOne({Date_table: moment().format('YYYY-MM-DD')})
    // console.log("Payment_data",Payment_data)
    if (Payment_data !== null) {
      const data = await strapi.services.payments.Payment_Create_Dashboard(resultUpdateData,1,Payment_data)
    }
    else {
      const data = await strapi.services.payments.Payment_Create_Dashboard(resultUpdateData)

    }
    const dataPayments= await strapi.query("payments").findOne({ id:ctx.params.id});
    const dataAddress= await strapi.query("addresses").findOne({ id:`${dataPayments.address_id}`});
    // console.log("dataPayments:",dataPayments.address_id);
    console.log("dataAddress:",dataAddress);
    await strapi.services.payments.send_Notication_Create(dataAddress.owner.id,resultUpdateData.data.BillsPayment_Invoice,1)
  }
},

async rejectReceipt(ctx){
  ctx.status = 200;
  const resultUpdateData=  await strapi.query('payments').update({id: ctx.params.id}, { BillsPayment_Status: 'Payment annotation',annotation_payment:ctx.request.body.annotation_payment }
  ).then((respon) => {
      return {
        status: true,
        data: respon
      };
    })
    .catch((err) => {
      console.log("payment to SCB-----",err)
      return {
        status: false,
        data: err.toString(),
      };
    });
    if(resultUpdateData.status === true){
      const dataPayments= await strapi.query("payments").findOne({ id:ctx.params.id});
      const dataAddress= await strapi.query("addresses").findOne({ id:`${dataPayments.address_id}`});
      // console.log("dataPayments:",dataPayments.address_id);
      console.log("dataAddress:",dataAddress);
      await strapi.services.payments.send_Notication_Create(dataAddress.owner.id,resultUpdateData.data,2)
    }
  },
  // createBillingPayment is function
async createBillingPayment(ctx) {
    // add data to db
    const data = await strapi.services.payments.create(ctx.request.body)
      .then((result) => {
        return {
          status: true,
          data: {
            id: result.id,
            total: result.Total_BillsPayment,
            BillsPayment_Invoice: result.BillsPayment_Invoice,
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
      const result = await strapi.services.payments.SCBservices(data.data);
      console.log("payment to SCB result",result)
      if (result.status === true) {
        // genarate scb qrcode
        // const resultQRcode = await strapi.services.payments.SCBgenarateCode(
        //   result.data,
        //   data.data.total,
        //   data.data.BillsPayment_Invoice
        // );
        if (result.status === true) {
          const { id } = data.data;
          const qr = result.data.qrImage;
          // update qrcode data by id
          // console.log("QR Image",qr)
          const resultEditData=  await strapi.query('payments').update({id: id}, {
            imageQR: qr,
          }).then((respon) => {
            // console.log("payment to SCB++++",respon)
              return {
                status: true,
              };
            })
            .catch((err) => {
              console.log("payment to SCB-----",err)
              return {
                status: false,
                data: err.toString(),
              };
            });
          if (resultEditData.status === true) {
            const dataAddress= await strapi.query("addresses").findOne({ id:ctx.request.body.address_id});
            // console.log("dataAddress:",dataAddress);
            await strapi.services.payments.send_Notication_Create(dataAddress.owner.id,ctx.request.body.Total_BillsPayment,0)
            console.log("craeted successfully",resultEditData)
            ctx.status = 200;
            ctx.body = "craeted successfully";
          } else {
            console.log('crated faill')
            ctx.status = 500;
            ctx.body = resultEditData.data;
          }
        } else {
          ctx.status = 500;
          ctx.body = data.data;
        }
      } else {
        console.log("SCB service fail")
        ctx.status = 500;
        ctx.body = data.data;
      }
    } else {
      ctx.status = 400;
      ctx.body = data.data;
    }
  },

  async getTotalYear(ctx){
   const totalYear= await strapi.services.payments.getBillingPaymentYear()
   ctx.status = 200;
   totalYear.data[0].totalStatus.map(e=>{
     e._id=moment().month(e._id).format('MMMM')
   })
   ctx.body = totalYear
  },
};
