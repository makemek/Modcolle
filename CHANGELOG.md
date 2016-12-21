# Modcolle Changelog

## 2016.12.21, Version 0.2.1
* Add new login strategy: DMM session
* Fix http 503 ocasionally happen when requesting assets from Kancolle server
* Optimize nginx for performance

## 2016.11.26, Version 0.2.0
* Request API token from Kancolle server using DMM account
* Have Nginx as a load balancer dealing with reverse proxy requests on port 80
* Automatically call Kancolle API on the destinated server without having to specify the server ip address.
* Basic login page
* Can be deployed as a Docker container
* Apply Node.js lint code rules
* Change license from MIT to Apache

## 2016.07.13, Version 0.1.0
Initial release