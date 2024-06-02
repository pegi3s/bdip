# Stage 1: Clone and Build Angular project
FROM node:lts-alpine as build-frontend

# Set the working directory
WORKDIR /angular

# Install git
RUN apk add --no-cache git

# Clone the repository
RUN git clone https://github.com/PabloG02/dockerfiles-website.git
WORKDIR /angular/dockerfiles-website

# Install dependencies
RUN npm install
# Build the website
RUN npm run build


# Stage 2: Build the Go backend
FROM golang:alpine AS build-backend

# Copy the backend code from the cloned repository
COPY --from=build-frontend /angular/dockerfiles-website/backend /app
WORKDIR /app

# Build the Go backend
RUN go build -o backend dockerfiles.go


# Stage 3: Serve the website with nginx
FROM nginx:stable-alpine
# Copy the build output to serve with nginx
COPY --from=build-frontend /angular/dockerfiles-website/dist/dockerfiles-website/browser /usr/share/nginx/html
# Copy the built Go binary
COPY --from=build-backend /app/backend /usr/bin/backend
# Expose ports
EXPOSE 80 8080

# Command to run both Nginx and the Go backend
CMD ["sh", "-c", "nginx -g 'daemon off;' & /usr/bin/backend"]
