# Ornitho.de Monitor
Monitor ornitho.de for rare bird reports and notify me if something worthwhile appeared. 

**Motivation:** Ornitho, while serving a good purpose is barely usable and offers no means of quickly checking your local area for interesting reports. Screen scarping and Google Cloud to the rescue!

## Overview

There are a few moving parts in the architecture and since I use this project to familiarize myself with Google Cloud, it is a bit over engineered.

__These are the main components:__

- **The Scraper** - Scrapes ornitho.de for recent reports and posts the result to a PubSub topic. Uses Puppeteer to launch a headless browser and collect the data. Deployed as a container in __Cloud Run__.
- **The Analyzer** (**planned**) - Cloud Function that triggers on messages from The Scraper on a PubSub Topic. Posts a message to the PubSub topic, in case it finds something worthwhile. Does book keeping in Storage Bucket. 
- **The Notifier** (**planned**) - Cloud Function that triggers on messages from The Analyzer. Updates a webpage and notifies users.

## Setup

### Local Development Requirements

- Node.js (I used v12)
- ```gcloud``` command line tool (deployments and reading logs, etc)
- Docker

__NOTE:__
This project currently only runs in docker and cannot be started locally. This is because it uses Puppeteer as a provided dependency inside container (saves a huge amount of installation time and guarantees that Puppeteer + Chrome + OS are all in sync).

To run locally, just add the puppeteer dependency ```npm install puppeteer```.

### Google Cloud

- Create a project in Google Cloud
- Create IAM Service Account for API Access
- Enable Functions, Cloud Run, PubSub, Cloud Scheduler, and a Storage Bucket


## Local Development

### Build, Run, Test the Scraper

    ./buildAndRunDOcker.sh
    curl http://localhost:9090/trigger-scrape
    ./killContainers.sh

__Start a local webserver, serving test data__

This is useful for tuning DOM queries in Puppeteer (remember to add the dependency on Puppeteer temporarily).

    npm run serveTestFile

### Manual Deployment of The Scraper in Cloud Run

Make sure you have set the gcloud command to use your intended project first. ```gcloud config set project <YOUR PROJECT NAME>```

    npm run buildCloudRunContainer
    npm run deployCloudRunContainer


## Relevant links

- __Cloud Scheduler__ - Schedule functions to run regularly https://cloud.google.com/scheduler/docs/tut-pub-sub#create_a_job
- __Running locally__ - Function Frameworks https://cloud.google.com/functions/docs/running/function-frameworks
- __Functions Framework__ - https://github.com/GoogleCloudPlatform/functions-framework-nodejs
- __Building Using Buildpacks__ - The 'pack' tool. https://cloud.google.com/functions/docs/building/pack
- __Deployment Flags__ - Command line deployment https://cloud.google.com/sdk/gcloud/reference/functions/deploy
