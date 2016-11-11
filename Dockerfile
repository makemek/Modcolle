FROM node:6.9.1

MAINTAINER Apipol Niyomsak

RUN npm install -g node-foreman

RUN mkdir -p /var/www/modcolle

# Define working directory
WORKDIR /var/www/mocolle

ADD bin/ src/ .env package.json Procfile /var/www/mocolle

RUN npm install

COPY docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]

# Expose port
EXPOSE 5000

# Run app
CMD npm start
