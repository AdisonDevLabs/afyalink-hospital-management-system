# Use a Node.js image for building the React app
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy pnpm-lock.yaml and package.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React app
RUN pnpm build

# --- Serving the production build with Nginx (Recommended for production) ---
FROM nginx:alpine AS production

# Copy the build output from the 'build' stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration for SPAs (create this file if needed)
# For a React SPA, you generally need to ensure all paths fall back to index.html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf 
# Create client/nginx/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]