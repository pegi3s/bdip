# Stage 1: Serve the website with nginx
FROM nginx:stable-alpine
# Copy the built website files to the nginx serve directory
COPY dist/dockerfiles-website/browser /usr/share/nginx/html
# Replace the default nginx configuration with our custom configuration (with proxy enabled)
COPY docker/deploy-local-build/default.conf /etc/nginx/conf.d/default.conf
# Expose ports
EXPOSE 80

# Start nginx
CMD ["sh", "-c", "nginx -g 'daemon off;'"]