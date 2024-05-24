FROM netlify/build:latest
FROM node:latest

USER 0
RUN mkdir -p /docker

WORKDIR /docker

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000
CMD ["npm", "run", "dev"]