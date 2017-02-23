FROM node:6.9.1

MAINTAINER Apipol Niyomsak

RUN npm install -g pm2

RUN mkdir -p /var/www/modcolle

# Define working directory
WORKDIR /var/www/modcolle

ADD . /var/www/modcolle/

VOLUME ["/var/www/modcolle/log"]

RUN npm install && npm run build

# Expose port
EXPOSE 5000

# Run app
CMD pm2-docker start process.json --auto-exit
