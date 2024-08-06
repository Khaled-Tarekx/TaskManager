FROM node:20.15-buster

RUN mkdir -p /app/src

WORKDIR /app/src

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 7500

CMD ["npm", "start"]
