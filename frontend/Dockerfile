# Step 1: Build the React application using Node
FROM node:18-alpine AS build
WORKDIR /app
# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
# Copy the rest of the frontend code and build it
COPY . .
RUN npm run build

# Step 2: Serve the static files using Nginx
FROM nginx:alpine
# Copy the built files from Vite's "dist" folder to Nginx's public folder
COPY --from=build /app/dist /usr/share/nginx/html
# Expose standard HTTP port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]