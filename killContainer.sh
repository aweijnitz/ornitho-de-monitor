#docker rm $(docker stop $(docker ps -a -q --filter ancestor=aweijn/ornitho-de-scraper --format="{{.ID}}"))
docker rm $(docker stop $(docker ps -a -q --filter ancestor=aweijn/ornitho-de-eventhandlers --format="{{.ID}}"))
