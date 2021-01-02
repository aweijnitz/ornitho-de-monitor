docker build -f Dockerfile.eventHandlers -t aweijn/ornitho-de-eventhandlers . && docker run -p 9092:8080 aweijn/ornitho-de-eventhandlers
