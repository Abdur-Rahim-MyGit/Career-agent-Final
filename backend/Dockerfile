FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production

COPY prisma ./prisma/
# Generate Prisma Client (sqlite/postgres)
RUN npx prisma generate

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
