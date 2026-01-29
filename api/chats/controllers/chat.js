'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async getChatRoom(ctx){
        // called by GET /hello
        // console.log('getChatRoom Start')
        // console.log("ctx=",ctx.params);
        const data = await strapi.services.chat.getDataRoomInfo(ctx.request.query.room_contains,ctx.request.query._sort);
        // roomInfo { room_contains: ':', _sort: 'time:desc,users_read:desc' }
       
        ctx.status = 200;
        ctx.body = data; // we could also send a JSON
       },
};
