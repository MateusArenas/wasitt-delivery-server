# FROM node:14-alpine
FROM node:latest

WORKDIR /usr/app
COPY package*.json yarn.lock ./

# RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
# RUN apk add --update krb5 make g++ && rm -rf /var/cache/apk/*
# RUN npm install -g node-gyp 
# RUN apt-get install libkrb5-dev
# RUN node-gyp install
# RUN yarn cache clean   
# RUN yarn set version 1.22.17
RUN yarn
# COPY package.json yarn.lock ./
# RUN npm config set python C:\DiretorioDeInstacao\python2.7
# sudo apt-get install python3
COPY . .

EXPOSE 3000
CMD ["yarn", "dev"]