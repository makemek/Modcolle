# Modcolle Changelog
## 2017.04.26, Version 0.3.1
### Notable Changes
* Maintenance Countdown Timer ([#16](https://github.com/makemek/Modcolle/pull/16))
appears when `Maintenance.IsDoing` in [Kancolle's config](http://203.104.209.7/gadget/js/kcs_const.js) set to `1` and `Maintenance.EndDateTime` is greater than client's machine time.
* `kancolle` folder removed ([#24](https://github.com/makemek/Modcolle/pull/24))
Modding content by redirecting url has been suspended.
If implement, they will be moved to a dedicated microservice.
* Use Node Alpine docker image ([#25](https://github.com/makemek/Modcolle/pull/25))
Smaller image size

### Commits
* [[`d8e1fda`](https://github.com/makemek/Modcolle/commit/d8e1fda)] update readme.md
* [[`a8ef58e`](https://github.com/makemek/Modcolle/commit/a8ef58e)] use node alpine image ([#25](https://github.com/makemek/Modcolle/pull/25))
* [[`95f97c3`](https://github.com/makemek/Modcolle/commit/95f97c3)] remove unused Kancolle folder ([#24](https://github.com/makemek/Modcolle/pull/24))
* [[`94b8340`](https://github.com/makemek/Modcolle/commit/94b8340)] fix(package): update url-join to version 2.0.1 ([#23](https://github.com/makemek/Modcolle/pull/23))
* [[`49f9f47`](https://github.com/makemek/Modcolle/commit/49f9f47)] chore(package): update nock to version 9.0.13 ([#22](https://github.com/makemek/Modcolle/pull/22))
* [[`892588e`](https://github.com/makemek/Modcolle/commit/892588e)] chore(package): update babel-preset-env to version 1.4.0 ([#21](https://github.com/makemek/Modcolle/pull/21))
* [[`c132000`](https://github.com/makemek/Modcolle/commit/c132000)] fix(package): update url-join to version 2.0.0 ([#20](https://github.com/makemek/Modcolle/pull/20))
* [[`db982b0`](https://github.com/makemek/Modcolle/commit/db982b0)] eslint: fix single quote error
* [[`e4feb81`](https://github.com/makemek/Modcolle/commit/e4feb81)] Maintenence countdown timer ([#16](https://github.com/makemek/Modcolle/pull/16))

## 2017.04.23, Version 0.3.0
### Notable Changes
* Frontend
  - Fallback support for font-awesome. Load font-awesome from their CDN. If fails, load them from the server
  - CSS and JS are now minified and uglified on build
  - Bigger launcher button
  - In development mode, sync css and js automaticaaly on file changes to browser
* Can be launched using PM2
* Incorporate new sinon v2 API changes
* `index.html` rendered statically

### Commits
* [[`02ded80`](https://github.com/makemek/Modcolle/commit/02ded80)] Update test code to new sinon v2 API (#18)
* [[`91087c4`](https://github.com/makemek/Modcolle/commit/91087c4)] Update dependencies to enable Greenkeeper <F0><9F><8C><B4> (#17)
* [[`648aba2`](https://github.com/makemek/Modcolle/commit/648aba2)] reuse eslint config from modcolle-eslint-config (#15)
* [[`cb07980`](https://github.com/makemek/Modcolle/commit/cb07980)] Bigger and smoother launcher button (#14)
* [[`0c7248a`](https://github.com/makemek/Modcolle/commit/0c7248a)] Run test coverage with nyc (#12)
* [[`b5b1db7`](https://github.com/makemek/Modcolle/commit/b5b1db7)] remove 'npm prune' from preinstall script (#13)
* [[`89d10a9`](https://github.com/makemek/Modcolle/commit/89d10a9)] fix http 502 when aquiring kc assets
* [[`3dc59b6`](https://github.com/makemek/Modcolle/commit/3dc59b6)] index.html as a static page (#11)
* [[`ca8bd10`](https://github.com/makemek/Modcolle/commit/ca8bd10)] gitignore only fonts and minified css/js (#10)
* [[`fb825f6`](https://github.com/makemek/Modcolle/commit/fb825f6)] Daemonized Modcolle with PM2 (#7)
* [[`8352973`](https://github.com/makemek/Modcolle/commit/8352973)] fix missing dependencies when run gulp build and prevent it from happening again
* [[`ca46350`](https://github.com/makemek/Modcolle/commit/ca46350)] make sure to return promises
* [[`21f49bb`](https://github.com/makemek/Modcolle/commit/21f49bb)] add .editorconfig file to enforce indentation and line ending
* [[`1acc0c8`](https://github.com/makemek/Modcolle/commit/1acc0c8)] Merge pull request #6 from makemek/fallback-font-awesome
* [[`c2ebbbe`](https://github.com/makemek/Modcolle/commit/c2ebbbe)] babel, uglify, and eslint fallback support
* [[`cb2e7fe`](https://github.com/makemek/Modcolle/commit/cb2e7fe)] fallback support for font-awesome
* [[`564729f`](https://github.com/makemek/Modcolle/commit/564729f)] import font-awesome to public assets on build
* [[`dec2db2`](https://github.com/makemek/Modcolle/commit/dec2db2)] configurable port for app and development
* [[`eaeedbd`](https://github.com/makemek/Modcolle/commit/eaeedbd)] offload font-awesome to cdn
* [[`c4cfe0a`](https://github.com/makemek/Modcolle/commit/c4cfe0a)] require css/style.min.css instead of style.css
* [[`5be85d5`](https://github.com/makemek/Modcolle/commit/5be85d5)] gulp build at prestart and pretest
* [[`38ba7bd`](https://github.com/makemek/Modcolle/commit/38ba7bd)] automatically sync .css and .hbs to browser when modified
* [[`a9c471f`](https://github.com/makemek/Modcolle/commit/a9c471f)] automatically autoprefix and minify css in src/views/*.css
* [[`7dba9b8`](https://github.com/makemek/Modcolle/commit/7dba9b8)] fix eslint test fail but doesn't trigger failure
* [[`1c9b8d3`](https://github.com/makemek/Modcolle/commit/1c9b8d3)] forget to remove semicolon to pass eslint

## 2017.01.27, Version 0.2.2
* Stylize index page (not optimized for mobile site yet) #4

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
