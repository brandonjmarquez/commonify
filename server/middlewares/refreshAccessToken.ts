import CryptoJS from "crypto-js";
import client from '../util/redis.js'

const refreshAccessToken = (client_id: string, client_secret: string) => {
  return async (req: any, res: any, next: Function) => {
    const code = req.query.code || null;
    console.log('code', code)
    const { id } = req.params
    const encrypted_token = await client.get(id + '_refresh') || null;
    const bytes = CryptoJS.AES.decrypt(encrypted_token!, process.env.cookie_key!);
    const refresh_token = bytes.toString(CryptoJS.enc.Utf8);
    console.log('id', id)
    const params = new URLSearchParams();
      params.append('code', code);
      params.append('refresh_token', refresh_token!);
      params.append('grant_type', 'refresh_token');
    const authOptions = {
      method: 'POST',
      body: params,
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new (Buffer as any).from(client_id + ':' + client_secret).toString('base64')) },
      json: true,
    };
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions)
    const data: any = await response.json();
    console.log('auth', data)
    res.cookie('refresh_token', encrypted_token)
    res.cookie('access_token', data.access_token, {maxAge: 3600000});
    next();
  }
}

export default refreshAccessToken;