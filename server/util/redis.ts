import { createClient } from 'redis';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
    password: process.env.redis_pword,
    socket: {
        host: process.env.redis_uri,
        port: 13041
    }
});

export default client;
//redis://default:Dlj8fXGE8C0AvrnQ57YEdSCc0b3HaOsJ@redis-13041.c283.us-east-1-4.ec2.cloud.redislabs.com:13041