import express from 'express';
import CryptoJS from "crypto-js";
import * as dotenv from 'dotenv';
dotenv.config();
import client from '../util/redis.js';
const friendRoutes = express.Router();
friendRoutes
    .get('/get-friend-playlists/:friendId', async (req, res) => {
    try {
        const encrypted_token = await client.get(req.params.friendId + '_refresh');
        var refresh_token = '';
        var access_token = await client.get(req.params.friendId + '_access');
        if (encrypted_token) {
            var bytes = CryptoJS.AES.decrypt(encrypted_token, process.env.cookie_key);
            refresh_token = bytes.toString(CryptoJS.enc.Utf8);
            const options = {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + access_token },
            };
            const profileRes = await fetch('https://api.spotify.com/v1/me', options);
            if (profileRes.status === 401) {
                const code = req.query.code || null;
                const params = new URLSearchParams();
                params.append('code', code);
                params.append('refresh_token', refresh_token);
                params.append('grant_type', 'refresh_token');
                const authOptions = {
                    method: 'POST',
                    body: params,
                    url: 'https://accounts.spotify.com/api/token',
                    headers: { 'Authorization': 'Basic ' + (new Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64')) },
                    json: true
                };
                const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
                const data = await response.json();
                access_token = data.access_token;
                client.set(req.params.friendId + '_access', access_token);
            }
            const playlistsRes = await fetch(`https://api.spotify.com/v1/users/${req.params.friendId}/playlists`, {
                headers: { 'Authorization': 'Bearer ' + access_token },
            });
            const playlistData = await playlistsRes.json();
            if (playlistData.items.length > 0) {
                res.status(200);
                res.send({ playlists: playlistData.items, message: "Friends playlists loaded successfully." });
            }
            else {
                res.status(200);
                res.send({ message: "No Playlists Found." });
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});
export default friendRoutes;
//# sourceMappingURL=friendRoutes.js.map