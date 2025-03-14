# Stage 1: Serve the website with nginx
FROM nginx:mainline-alpine
# Copy the built website files to the nginx serve directory
COPY dist/dockerfiles-website/browser /usr/share/nginx/html
# Replace the default nginx configuration with our custom configuration (with proxy enabled)
COPY docker/deploy-local-build/default.conf /etc/nginx/conf.d/default.conf
# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl
# Expose ports
EXPOSE 80 443

# Start nginx with a script that generates certificates if needed
RUN apk add openssl
COPY docker/deploy-local-build/start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
