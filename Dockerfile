FROM node:6-alpine

LABEL maintainer "Apipol Niyomsak"

ARG PORT
ENV PORT=${PORT} \
    DEPLOY_DIR=/var/www/modcolle

WORKDIR ${DEPLOY_DIR}
ADD . ${DEPLOY_DIR}
RUN npm install --only=production -g pm2 && \
    npm install && \
    npm run build

EXPOSE ${PORT}

CMD pm2-docker start process.json --auto-exit
