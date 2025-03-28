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

# Determine web root based on BASE_HREF
WEB_ROOT="/usr/share/nginx/html"
if [ "$BASE_HREF" != "/" ]; then
    # Ensure BASE_HREF starts with a single slash and does not end with a slash
    # Example: /bdip
    BASE_HREF=$(echo "$BASE_HREF" | sed 's|^\(/*\)|/|; s|/*$||')

    WEB_ROOT="/usr/share/nginx/html${BASE_HREF}"

    # Use a temporary directory to move files without including the target directory
    TEMP_DIR=$(mktemp -d)
    mv /usr/share/nginx/html/* "$TEMP_DIR"
    # Create the new web root directory
    mkdir -p "$WEB_ROOT"
    # Move from the temporary directory to the new web root
    mv "$TEMP_DIR"/* "$WEB_ROOT"
    # Clean up the temporary directory
    rmdir "$TEMP_DIR"

    # Update Nginx try_files directive to reflect BASE_HREF
    sed -i "s|try_files \$uri \$uri/ /index.html;|try_files \$uri \$uri/ ${BASE_HREF}/index.html;|g" /etc/nginx/conf.d/default.conf
fi

# Set base href in index.html
sed -i "s|<base href=\"[^\"]*\"|<base href=\"${BASE_HREF%/}/\"|g" "$WEB_ROOT"/index.html

# Ensure PROXY_BASE_HREF is set, defaulting to BASE_HREF if not provided
PROXY_BASE_HREF=${PROXY_BASE_HREF:-$BASE_HREF}
if [ "$PROXY_BASE_HREF" != "/" ]; then
  # Ensure PROXY_BASE_HREF starts and ends with a slash
  # Example: /bdip-proxy/
  PROXY_BASE_HREF=$(echo "$PROXY_BASE_HREF" | sed 's|^\(/*\)|/|; s|/*$|/|')
fi
# Update Nginx configuration for proxy
if [ "$PROXY_BASE_HREF" != "/" ]; then
  # Replace proxy_pass with upstream_endpoint
  sed -i "/location \/v2\/namespaces\/pegi3s\/repositories/{
    :a
    n
    /^[[:space:]]*proxy_pass/{
      i\
        rewrite ^$PROXY_BASE_HREF(.*)$ /\$1 break;
      s|proxy_pass .*;|proxy_pass \$upstream_endpoint;|
      b
    }
    ba
  }" /etc/nginx/conf.d/default.conf
fi
sed -i "s|/v2/namespaces/pegi3s/repositories|${PROXY_BASE_HREF}v2/namespaces/pegi3s/repositories|g" /etc/nginx/conf.d/default.conf
# Set proxy base href
sed -i "s|/v2/namespaces/pegi3s/repositories|${PROXY_BASE_HREF}v2/namespaces/pegi3s/repositories|g" "$WEB_ROOT"/main*.js

# Start nginx
echo "Starting Nginx..."
exec nginx -g 'daemon off;'
