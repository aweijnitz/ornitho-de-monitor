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
This project currently only runs in docker and cannot be started locally. This is because it uses Puppeteer as a provided 
dependency inside container (saves a huge amount of installation time and guarantees that Puppeteer + Chrome + OS are all 
in sync).

To run locally, just add the puppeteer dependency ```npm install puppeteer```.

### Google Cloud

- Create a project in Google Cloud
- Create IAM Service Account for API Access
- Enable Functions, Cloud Run, PubSub, Cloud Scheduler, and a Storage Bucket
- Deployment takes place using Google Cloud Build CI/CD hooked up to monitor the branch ```deploy``` on this repo.

## Local Development

### Build, Run, Test the Scraper

    ./buildAndRunDOcker.sh
    curl http://localhost:9090/trigger-scrape
    ./killContainers.sh

__Start a local webserver, serving test data__

This is useful for tuning DOM queries in Puppeteer (remember to add the dependency on Puppeteer temporarily).

    npm run serveTestFile

## Deployment

Deployments are triggered by pushing code to the branch ```deploy```. This triggers a CI/CD job in Google Cloud Build.

    git checkout deploy
    git merge master
    git push

There is only one build file, ```cloudbuild.yaml```. The functions and the docker container are always built and deployed in concert. 
This is because the system is small enough to build fast and deploying everything together is an easy way to keep things 
consistent.

## Implementation Details

### Message Format

The scraper scrapes and posts a report message to the Topic with the following format

    { 
        hits: […SearchHitItems], 
        md5: <MD5 hash of hits array>, 
        reportDate: <Day of the report, ex '30.12.2020'>, 
        runTimestamp: <Unix epoch of the run. ex 1609362435719> 
        url: <URL used for the scrape run>
    }

The __SearchHitItems__ are structured as follows

    {
        location: <Name of reported location in Ornitho>
        reports: [<array of reported spieces>]
    }

### Book keeping

To remember and compare new reports to previous data, a book-keeping file is kept in a Cloud Storage Blob.
It is simply a serialized JSON object with the following format:

    {
        created: <Data of blob creation, in the format of Date.now()>,
        latestHash: <last seen hash>,
        reports: [<last few report messages, most recent first>]
    }
        

## Relevant links

- __Cloud Scheduler__ - Schedule functions to run regularly https://cloud.google.com/scheduler/docs/tut-pub-sub#create_a_job
- __Running locally__ - Function Frameworks https://cloud.google.com/functions/docs/running/function-frameworks
- __Functions Framework__ - https://github.com/GoogleCloudPlatform/functions-framework-nodejs
- __Building Using Buildpacks__ - The 'pack' tool. https://cloud.google.com/functions/docs/building/pack
- __Deployment Flags__ - Command line deployment https://cloud.google.com/sdk/gcloud/reference/functions/deploy
