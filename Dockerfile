# Use an official Node.js LTS runtime as a parent image, using the Alpine Linux version for smaller size
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH for easier command execution
ENV PATH /app/node_modules/.bin:$PATH

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies in a silent mode to reduce log output
RUN npm install --silent

# Copy the rest of the application code
COPY . .

# Expose port 3001 to the outside world
EXPOSE 3001

# Create a non-root user to run the application securely
RUN adduser -D myuser
USER myuser

# Define the command to run the app
CMD ["npm", "start"]

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

