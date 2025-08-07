FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
RUN npm install -g nodemon
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]