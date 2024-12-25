# Use the official Node.js image as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Note: to speed up the process, we run npm install in the machine and then copy the libraries every time we run the container
# Copy the package.json and package-lock.json files to the working directory
# COPY package*.json ./

# Install the application dependencies
# RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "--env-file=.env", "main.js"]