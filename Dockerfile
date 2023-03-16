FROM node

WORKDIR /build/server
COPY server/package.json /build/server
RUN npm i
COPY ./server /build/server

EXPOSE 3001

CMD ["npm", "run", "dev"]