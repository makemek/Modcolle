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
Modcolle do all those messy things for you.
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

### On Mac and Linux

1. Install [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone this repository `git clone git@github.com:makemek/Modcolle.git`
3. Copy `.env.template` to `.env` and configure
  - SESSION_SECRET: a key for computing hash to generate a session. Can be any string
  - LOGGER_SILENT: if `false` enables log, `true` disables log
  - LOGGER_LEVEL: select a [logging level](https://github.com/winstonjs/winston#logging-levels)
4. Open terminal and run `docker-compose up`. You can add `-d` flag to detach the process and run as a daemon.
5. Open a web browser and type `localhost` in the url

### On windows
Unfortunately, Docker is not natively supported on Windows.
Also there is a shell script that be executed only in linux environment.
You have to install Nginx and Modcolle manually.

1. Install Nginx and Node.js (v. 6.9.1)
2. Clone this repository `git clone git@github.com:makemek/Modcolle.git`
3. Copy `.env.template` to `.env` and configure
  - SESSION_SECRET: a key for computing hash to generate a session. Can be any string
  - LOGGER_SILENT: if `false` enables log, `true` disables log
  - LOGGER_LEVEL: select a [logging level](https://github.com/winstonjs/winston#logging-levels)
4. Copy `/deployment/nginx/nginx.conf` to `C:\nginx\`. Make sure to backup nginx.conf first before overwrite.
5. Inside nginx.conf replace `app1` and `DOMAIN_NAME` with `localhost`
6. Open terminal and start Nginx `start C:\nginx\nginx.exe`
7. `cd` to modcolle directory and run `npm install`
8. Type `npm start`
9. Open a browser and type `localhost` in the url 
