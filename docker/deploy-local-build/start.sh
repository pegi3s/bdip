#!/bin/sh
set -e

# Check if certificates exist, if not generate self-signed ones
if [ ! -f /etc/nginx/ssl/nginx.crt ] || [ ! -f /etc/nginx/ssl/nginx.key ]; then
    echo "SSL certificates not found, generating self-signed certificates..."
    echo "Using $(openssl version)"
    mkdir -p /etc/nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx.key \
        -out /etc/nginx/ssl/nginx.crt \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    echo "Self-signed certificates generated."
else
    echo "Using existing SSL certificates."
fi

# Start nginx
echo "Starting Nginx..."
exec nginx -g 'daemon off;'
