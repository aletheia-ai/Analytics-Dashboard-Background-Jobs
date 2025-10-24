
    FROM node:20-alpine AS builder

    WORKDIR /app




    COPY package.json package-lock.json* ./


    RUN npm install


    COPY . ./


    RUN npm run build



    FROM node:20-alpine AS runner

    WORKDIR /app


    COPY package.json package-lock.json* ./


    RUN npm install 


    COPY --from=builder /app/dist ./dist


    EXPOSE 7000

Run compiled JS
    CMD ["node", "dist/server.js"]