# Phenotypic Evolution Group Dockerfiles Website

This repository contains the source code for the Phenotypic Evolution Group Dockerfiles website. The website is built using Angular 19.2.1 and is hosted on GitHub Pages.

## Getting Started

### Prerequisites

To build and run the website locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) 18.19.1 or higher
- [Go](https://go.dev/dl/) 1.22.2 or higher

### Installation

Follow these steps to set up the project:

1. Clone the repository to your local machine.
2. Run `npm install` to install the dependencies.

## Development Server

To start working on the website:

1. Run `npm run dev` in your terminal. This command will launch a development server.
2. Open your browser and navigate to `http://localhost:4200/` to view the website.

The application will automatically reload if you make any changes to the source files.

## Build

To build the website for production, run `ng build`. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Deployment

### Docker

To deploy the website using Docker, go to the root directory of the project and follow these steps:

1. **Build the Docker image.**

   To ensure the Docker build process fetches the latest changes from the repo and does not use any cached layers, use the `--no-cache` option.

    ```bash
    docker build --no-cache -t dockerfiles-website -f docker/git-clone-and-deploy/Dockerfile .
    ```

2. **Run the Docker container.**

    ```bash
    docker run -d -p 80:80 -p 8080:8080 --name dockerfiles-website-container dockerfiles-website
    ```

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
