import 'dotenv/config';

const env = {
  USER: process.env.USER_NAME,
  PASSWORD: process.env.USER_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default env;
