# Modcolle
[![Build Status](https://travis-ci.org/makemek/Modcolle.svg?branch=dev)](https://travis-ci.org/makemek/Modcolle)
[![Coverage Status](https://coveralls.io/repos/github/makemek/Modcolle/badge.svg?branch=dev)](https://coveralls.io/github/makemek/Modcolle?branch=dev)

> **This is a pre-release version. Some feature may not be stable and require some configuration beforehand.**

Modcolle is a proxy server for playing [Kantai Collection (艦隊これくしょん ～艦これ～)](http://www.dmm.com/netgame_s/kancolle/).
Unlike [Kancolle Viewer](https://github.com/Grabacr07/KanColleViewer) that wraps IE browser and listens to outgoing traffic, Modcolle intercepts network traffic sent between the game and its destinated server directly.
Thus, it can do something before and after the game makes API calls to the server or even manipulates the API data itself.

## Feature
* Adaptive fullscreen gameplay
* Place custom content to be displayed inside a game such as ships, musics, or any game assets similar to [KancolleCacher](https://github.com/df32/KanColleCacher).
* Display translations inside the game **[Possible, but not ready for general usage]**
* Realtime logging. See what Kancolle makes requests to the server including decoded API requests and responses

## Installation
Please follows steps below to run Modcolle

1. Download and install [Node.js](https://nodejs.org/en/) version >= 5.0.0 (preferably 6)
2. Download and extract Modcolle
3. Go scripts/config copy ``settings.json.template``. Paste it in the same directory and rename it to ``settings.json``
4. Open ``settings.json`` and put your World server IP address in ``MY_WORLD_SERVER`` and your api token in ``API_TOKEN``
5. Go to extracted directory, open the commandline and type ``npm install``
6. Type ``npm start``
7. Wait for message "modcolle is ready". Then, open the browser and type ``localhost`` or ``127.0.0.1`` to URL.

## Modding
Please see [this](http://himeuta.org/showthread.php?4880-Guide-Mod-Your-Game-Guide) on how to mod game assets.
You need flash decompiler program in order to modify swf files.
[JPEX Flash Decomplier](https://www.free-decompiler.com/flash/download/) is free of charge and has straight forward interface.

Prior the game requesting resource, Modcolle will look for files inside /kancolle folder.
If the file is not found, Modcolle will request resource from Kancolle server.
All you have to do is place your files inside a correct directory.
So make sure that your files reflect the same path as it resides in Kancolle server.
You can see where to place your file from logging information when the game requests resource.

Please note that once Modcolle sends resource back to the game, your browser cache it as soon as the download is complete unless you disable caching.
There will be no request to Modcolle because the browser has already load from its cache.
If you update the mod file, please either restart the server or clear browser cache.

## Modifying API Response and In-game Translation
Inside ``/scripts/routing/kcsapi/index.js``, the code
```javascript
decodeResponse(httpResponse, body, function(response) {
	var jsonResponse = JSON.parse(response.replace('svdata=', ''));
	// modify json here
}
```
