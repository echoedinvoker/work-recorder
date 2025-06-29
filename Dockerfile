FROM mcr.microsoft.com/playwright:v1.53.0-noble
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
RUN npx playwright install
