FROM node:6-alpine

LABEL maintainer "Apipol Niyomsak"

ENV PORT=5000 \
    DEPLOY_DIR=/var/www/modcolle \
    USER=www

ADD . ${DEPLOY_DIR}

RUN adduser -S $USER && \
    chown -R $USER \
      $DEPLOY_DIR \
      /usr/local/lib \
      /usr/local/bin

USER ${USER}
WORKDIR ${DEPLOY_DIR}
RUN npm install --only=production -g pm2 && \
    npm install && \
    npm run build

EXPOSE ${PORT}

CMD pm2-docker start process.json --auto-exit
