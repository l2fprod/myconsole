export APP_ROOT=$PWD/src/static
export PORT=8080
mkdir -p $PWD/src/static/nginx/logs
erb src/static/nginx.conf > local-nginx.conf
nginx -c $PWD/local-nginx.conf
