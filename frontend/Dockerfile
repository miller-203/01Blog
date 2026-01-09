# 1. Use NGINX as the base image
FROM nginx:alpine

# 2. Copy the build output (HTML/JS) to NGINX folder
# NOTE: Check your dist folder structure. 
# If it is dist/frontend/browser, use the line below:
COPY dist/frontend/browser /usr/share/nginx/html

# 3. Copy our custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 4. Expose port 80
EXPOSE 80