const axios = require("axios").default;
const firebase_admin = require("firebase-admin");
const serviceAccount = require("./hyde-heritage-9df6e-firebase-adminsdk.json");
const moment = require("moment");

firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(serviceAccount)
});

const getBooking = async ()=>{
    const firestore = firebase_admin.firestore();
    const FieldValue = firebase_admin.firestore.FieldValue;
    await firestore.collection("reservations").where("statusNotification",'==',false).where("date",'==',moment().format("YYYY-MM-DD")).get().then((result) => {
        result.forEach(async dataBooking => {
            if(dataBooking.data()){
                const result=dataBooking.data()
                const dataNoti={
                    userFullName:result.userFullName,
                    facilityName:result.facilityName,
                    topic:result.topic,
                    note:result.note,
                    date:result.date,
                    slot:result.slot,
                    id: result.user,
                    startTime: result.startDateTime.toDate(),
                    endTime: result.endDateTime.toDate(),
                    name: result.name,
                    room_name: result.facility_name,
                    note: result.note,
                }

                
              let now =moment(new Date()).tz("Asia/Bangkok")
              let dataTime= moment(new Date()).tz("Asia/Bangkok")
               
             let  time=moment(result.slot.slice(0,5),"HH:mm")
              dataTime.set({
                hour:time.get('hour'),
                minute:time.get('minute')
              })
               console.log('booking data time ========>',now,time.get('hour'))
                let diff = now.diff(dataTime, "minute");

                // let startDate = moment(result.startDateTime.toDate())
                // let endDateTime = moment(result.endDateTime)
                // console.log('startDate ========>',startDate)
                // console.log('endDateTime ========>',endDateTime)
                // let diff = result.endDateTime.diff(result.startDateTime,"minute");

  
       console.log("booking =========> string:", diff.toString().indexOf("-"));
       switch (diff) {
        case -30:
          if (result.statusNotification30Min===false) {
            console.log("30 min start.");
            result.statusNotification30Min=true
            console.log("data booking:",dataBooking.data());
            await sendNotificationBooking30Min(result.user,dataNoti)
            await firestore.collection("reservations").doc(`${dataBooking.id}`).set(result,{merge:true})
          }
          break;
       case 0:
        if (result.statusNotification===false) {
          console.log("0 min start.");
          result.statusNotification=true
          console.log("data booking:",dataBooking.data());
          await sendNotificationBooking(result.user,dataNoti)
          await firestore.collection("reservations").doc(`${dataBooking.id}`).set(result,{merge:true})
        }
        break;
        default:
          break;
       }
            }
        });
    }).catch((err) => {
        
    });
}

const sendNotificationBooking =async (userId,data)=> {
    await axios.post("https://hyde-notification.artanitech.com/api/message/send", {
        userId:`${userId}`,
        message: {
          notification: {
            title: "Reserved Facility",
            body: `Today you have a ${data.room_name} reservation facility on ${data.date} from ${data.slot}.`,
          },
         data:data
        },
      });
  }

  const sendNotificationBooking30Min =async (userId,data)=> {
    await axios.post("https://hyde-notification.artanitech.com/api/message/send", {
        userId:`${userId}`,
        message: {
          notification: {
            title: "Reserved Facility",
            body: `Reservations for ${data.room_name} will start in 30 minutes. ${data.date} from ${data.slot}.`,
          },
          data:data
        },
      });
  }



module.exports = {getBooking};