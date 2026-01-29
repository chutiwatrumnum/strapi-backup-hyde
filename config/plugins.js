module.exports = ({ env }) => ({
  email: {
    provider: "nodemailer",
    providerOptions: {
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: "developers.lifestyletech@gmail.com",
        pass: "8cdMTFRDx1w2EQra",
      },
    },
    // providerOptions: {
    //   host: "exchange.grandeasset.com",
    //   port: 25,
    //   secure: false,
    //   ignoreTLS:true,
    //   auth: {
    //     user: "hydeheritage@grandeasset.com",
    //     pass: "Mar0818",
    //   },
    // },
    settings: {
      defaultFrom: "hydeheritage@grandeasset.com",
      defaultReplyTo: "hydeheritage@grandeasset.com",
    },
  },
});
