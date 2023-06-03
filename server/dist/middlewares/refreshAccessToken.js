const refreshAccessToken = (client_id, client_secret) => {
    return async (req, res, next) => {
        const code = req.query.code || null;
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('refresh_token', req.session.refresh_token);
        params.append('grant_type', 'refresh_token');
        const authOptions = {
            method: 'POST',
            body: params,
            url: 'https://accounts.spotify.com/api/token',
            headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
            json: true,
        };
        const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
        const data = await response.json();
        req.session.access_token = data.access_token;
        next();
    };
};
export default refreshAccessToken;
//# sourceMappingURL=refreshAccessToken.js.map