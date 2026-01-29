module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cron: {
    enabled: true,
    // tasks: cronTasks,//
  },
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'eeaca83bc8e3bab67300e4418fc48017'),
    },
  },
});
