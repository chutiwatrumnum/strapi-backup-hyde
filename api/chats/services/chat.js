'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
    async getDataRoomInfo(room,sort) {
        try {
          console.log("sorData:",sort);
        const resultData = await strapi.query("chat").find({room:/.*:.*/,_sort:`${sort}`})  
         console.log('',resultData.length)
         resultData.map((e)=>{
          let room_info={}
          if (e?.room_info?.avatar) {
            room_info.avatar=e?.room_info?.avatar
          } 
          room_info.fullname=e?.room_info?.fullname? e.room_info.fullname:"Hyde user",
          // const room_info ={
          //  fullname: e?.room_info?.fullname? e.room_info.fullname:"test",
          //  avatar: e?.room_info?.avatar?   e.room_info.avatar :"",
          // }
       e.room_info= room_info
         })
        return resultData
        } catch (err) {
          console.error(err)
        }
        },
};
