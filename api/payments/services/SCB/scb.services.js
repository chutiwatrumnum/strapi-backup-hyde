const store = require("store");
const Axios = require("axios");
const { API_KEY_SANDBOX, API_SECERT_SANDBOX,API_BILL_ID_SANDBOX,SCB_URL } = process.env;
//scbgetToken is function get token from scb api
const scbGetToken = async () => {
  const headers = {
    resourceOwnerId: API_KEY_SANDBOX,
    requestUId: "c385f890-ba04-4973-9939-98ce407ed740",
    "accept-language": "EN",
  };
  const dataPayload = {
    applicationKey: API_KEY_SANDBOX,
    applicationSecret: API_SECERT_SANDBOX,
  };
  const Token = await Axios.post(`${SCB_URL}/oauth/token`, dataPayload, {
    headers: headers,
  })
    .then((result) => {
      if (result.status === 200) {
        return {
          status: true,
          data: result.data.data.accessToken,
        };
      }
    })
    .catch((error) => {
      return {
        status: false,
        massage: error.toString(),
      };
    });
  return Token;
};
const setLocalStroage = async (name, data) => {
  try {
    await store.set(name, data);
    return {
      status: true,
    };
  } catch (error) {
    return {
      status: false,
      massage: error.toString(),
    };
  }
};
const testconjob = async () => {
  const resultData = await strapi
  .query("payments")
  .find({ BillsPayment_Status: "Wait for payment" });
  console.log('testjob:',resultData)
};
const getLocalStroage = async (name) => {
  try {
    const resultData = await store.get(name);
    if (resultData === undefined) {
      return {
        status: false,
        massage: "data empty.",
      };
    } else {
      return {
        status: true,
        data: resultData,
      };
    }
  } catch (error) {
    return {
      status: false,
      massage: error.toString(),
    };
  }
};
//SCBgenarateCode is functon genQRcode from scb api input data token,total,billingid
const SCBgenarateCode = async (Token, amount, item) => {
  console.log("API_KEY:",API_KEY_SANDBOX)
  console.log("API_SECERT:",API_SECERT_SANDBOX)
  console.log("API_BILL_ID:",API_BILL_ID_SANDBOX)
  const url = `${SCB_URL}/payment/qrcode/create`;
  let data = {
    qrType: "PP",
    ppType: "BILLERID",
    ppId: API_BILL_ID_SANDBOX,
    amount: amount,
    ref1: item !== null ? item : "unkwon",
    ref2: "OA02154154",
    ref3: "SCB",
  };
  const result = await Axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${Token}`,
      resourceOwnerId: API_KEY_SANDBOX,
      requestUId: "b716e333-7b89-4f9c-a6b5-77c800212f2c",
      "accept-language": "EN",
    },
  })
    .then((response) => {
      return { status: true, data: response.data.data };
    })
    .catch((error) => {
      return { status: false, data: error.toString() };
    });
  return result;
};
module.exports = {setLocalStroage,getLocalStroage,scbGetToken,SCBgenarateCode,testconjob};
