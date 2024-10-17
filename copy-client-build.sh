#!/bin/bash

# Define directories
CLIENT_BUILD_DIR="/home/user/royalgames/royalgames-client/build"
SERVER_PUBLIC_DIR="/home/user/royalgames/royalgames-server/public"

# Check if client build directory exists
if [ ! -d "$CLIENT_BUILD_DIR" ]; then
  echo "Error: Client build directory does not exist: $CLIENT_BUILD_DIR"
  exit 1
fi

# Create server public directory if it doesn't exist
if [ ! -d "$SERVER_PUBLIC_DIR" ]; then
  echo "Server public directory does not exist. Creating: $SERVER_PUBLIC_DIR"
  mkdir -p "$SERVER_PUBLIC_DIR"
fi

# Copy contents from client build to server public directory
echo "Copying files from $CLIENT_BUILD_DIR to $SERVER_PUBLIC_DIR..."
cp -r "$CLIENT_BUILD_DIR"/* "$SERVER_PUBLIC_DIR"

# Confirm completion
echo "Client build files have been successfully copied to server public directory."
