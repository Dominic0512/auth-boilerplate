export default () => {
  return {
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      name: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
    },
  };
};
