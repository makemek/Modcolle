# Modcolle

[![Build Status](https://travis-ci.org/makemek/Modcolle.svg?branch=dev)](https://travis-ci.org/makemek/Modcolle)
[![Coverage Status](https://coveralls.io/repos/github/makemek/Modcolle/badge.svg?branch=dev)](https://coveralls.io/github/makemek/Modcolle?branch=dev)

Modcolle is a proxy server for playing [Kantai Collection (艦隊これくしょん ～艦これ～)](http://www.dmm.com/netgame_s/kancolle/).
The main goal of Modcolle is to provide in-game translation displaying in the flash client directly.
Unlike [Kancolle Viewer](https://github.com/Grabacr07/KanColleViewer) that wraps IE browser and listens to outgoing traffic, Modcolle, acting as a web server, makes Kancolle send all HTTP requests to Modcolle instead.
Thus, it has the opportunity to process requests before forwarding them to destinated Kancolle servers or response back to clients.
In this case, Modcolle is a middleman between client and Kancolle servers.
Client can access modcolle without having to configure proxy connection.
No more cookie injection, ~~Japan timezone synchronization~~, or VPN connection in order to play the game.
Modcolle do all those things behind the scenes.
Since the processes involves calling DMM API directly, no bloating javascript is executed, it is faster than accessing from [DMM website](http://www.dmm.com).
Modcolle also distributes game asset requests .png, .mp3, and .swf among multiple Kancolle servers to relief traffic bottle neck.
Ensures that all assets will be delivered as fast as possible.

## Feature
* Enjoy playing the game on full screen
* ~~Place custom content to be displayed inside a game such as ships, musics, or any game assets similar to [KancolleCacher](https://github.com/df32/KanColleCacher).~~ **this feature is suspeneded, will implement sometime later**
* Display translations inside the game **Just for a proof of concept. No full translation are implemented in this release**
* Realtime logging. See what Kancolle makes requests to the server including decoded API requests and responses for statistical analysis

## Installation
Modcolle is a Node.js server application, not a desktop application.
There is no executable launcher.
It is intended to run on a web server.
However, you can setup your machine as a web server to run Modcolle locally.

Modcolle needs to run together with [Nginx](https://www.nginx.com/) in order to operate normally.
Please follows steps below to run Modcolle

### Docker

1. Install [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone this repository `git clone git@github.com:makemek/Modcolle.git` and run `npm install`
3. Open terminal and run `docker-compose up`. You can add `-d` flag to detach the process and run as a daemon.
4. Open a web browser and type `localhost` in the url

### Manual Installation

1. Install Nginx and Node.js (v. 6.9.1)
2. Clone this repository `git clone git@github.com:makemek/Modcolle.git` and run `npm install`
3. Copy `/deployment/nginx/nginx.conf` to `\path\to\nginx\conf`. Make sure to backup nginx.conf first before overwrite.
4. Inside nginx.conf replace `app1` and `DOMAIN_NAME` with `localhost`
5. Start nginx
6. Type `npm install pm2 -g` and run `npm start`
7. Open a browser and type `localhost` in the url

## Starting the Application
### Cluster Mode
This command runs [pm2](https://npmjs.org/packages/pm2) using configuration defined in `env` of [process.yml](https://github.com/makemek/Modcolle/blob/master/process.yml).
```
npm start
```
You can also start the application in production mode by passing `--env production` to pm2.
```
npm start -- --env production
```

### Development Mode
With [nodemon](https://npmjs.org/packages/nodemon) and [browser-sync](https://npmjs.org/packages/browser-sync)
> **In this mode, no environment variables are loaded**.
You can still set them inside a command line if needed.
```
npm run dev

-----------
(optional) configure browser-sync using environment variables before running.
PORT=<port number> # browser-sync app's proxy port; default is 5000
PORT_DEV=<port number> # browser-sync listeing port; default is 3000
```

## Configuration
`process.yml` is PM2's [process file](http://pm2.keymetrics.io/docs/usage/application-declaration/) for Modcolle.
Inside `process.yml`, `env` contains common environment variables required by the application.
`env_production` used in production contains envrionment variables that overrides variables in `env`.

### Environment Variables
- LOGGER_LEVEL: select a [logging level](https://github.com/pinojs/pino/blob/master/docs/API.md#level)
- LOGGER_PRETTY: pretty print log (should be set to `false` in production)
- PORT: application port
- PORT_DEV: **FOR DEVELOPMENT ONLY** will take effect when run `npm run dev`
- KANCOLLE_SERVER_MASTER: A host name for main Kancolle server that have interface`/kcsapi/api_world/get_id` for requesting players world id
- KANCOLLE_SERVER_#: A host name for other Kancolle servers where `#` is `world id`
