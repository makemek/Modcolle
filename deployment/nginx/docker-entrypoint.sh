#!/bin/bash -e

# Replace occurance of DOMAIN_NAME in nginx with target domain name
sed -i s/DOMAIN_NAME/$DOMAIN_NAME/g /etc/nginx/nginx.conf
cat /etc/nginx/nginx.conf
exec "$@"
