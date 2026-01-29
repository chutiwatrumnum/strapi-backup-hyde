module.exports = ({ env }) => {

  return {
    defaultConnection: 'default',
    connections: {
      default: {
        connector: 'mongoose',
        settings: {
          client: 'mongo',
          host: env('DATABASE_HOST', 'localhost'),
          srv: env.bool('DATABASE_SRV', false),
          port: env.int('DATABASE_PORT', 27017),
          database: env('DATABASE_NAME', 'strapi'),
          username: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
        },
        options: {
          authenticationDatabase: env('DATABASE_NAME', null),
          ssl: env.bool('DATABASE_SSL', false),
        },
      },
    },
  }
};
