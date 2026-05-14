import { createClient } from 'redis';

const redisclient = createClient({
    url: process.env.REDIS_URL
});

redisclient.on('error', err => console.error('Redis Client Error', err));

export default redisclient;