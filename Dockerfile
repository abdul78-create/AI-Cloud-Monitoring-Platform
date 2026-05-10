FROM node:18-alpine

WORKDIR /app

ARG SERVICE_NAME

# Copy root package.json if needed, or service specific
# Let's assume service specific package.json

COPY services/${SERVICE_NAME}/package*.json ./

RUN npm install

COPY services/${SERVICE_NAME}/ ./

RUN npm run build || true

CMD ["npm", "start"]
