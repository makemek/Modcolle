FROM node:6.9.1

MAINTAINER Apipol Niyomsak

RUN npm install -g foreman

RUN mkdir -p /var/www/modcolle

# Define working directory
WORKDIR /var/www/modcolle

ADD . /var/www/modcolle/

RUN npm install

# Expose port
EXPOSE 5000

# Run app
CMD npm start
