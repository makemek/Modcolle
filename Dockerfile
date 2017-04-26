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
    npm install --only=development && \
    npm run build && \
    rm -rf node_modules && \
    npm install --only=production

EXPOSE ${PORT}

CMD pm2-docker start process.yml --env production --auto-exit
