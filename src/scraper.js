const puppeteer = require('puppeteer');
const crypto = require('crypto');
const { publishObservationsMessage } = require('./utils/publishMessage');
const { formatDate } = require('./utils/reportUtils');
const {
  isProductionMode,
  currentRunMode
} = require('./utils/runtimeUtil');

const mode = currentRunMode();
console.log('Starting in mode ' + mode)

const PUPPETEER_OPTIONS = {
  headless: true,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--single-process',
    '--deterministic-fetch',
  ],
};

const getTodayString = () => {
  const date = new Date();
  return formatDate(date);
}

const getScrapeURL = () => {
  // Setup scraping target
  const today = getTodayString();
  let URL = 'http://localhost:8000/testfile.html';
  if (isProductionMode())
    URL = `https://www.ornitho.de/index.php?m_id=94&p_c=5&p_cc=213&sp_tg=1&sp_DFrom=${today}&sp_DTo=${today}&sp_DSeasonFromDay=2&sp_DSeasonFromMonth=1&sp_DSeasonToDay=31&sp_DSeasonToMonth=12&sp_DChoice=offset&sp_DOffset=1&speciesFilter=&sp_S=32045&sp_SChoice=category&sp_Cat[veryrare]=1&sp_Cat[rare]=1&sp_Family=1&sp_PChoice=canton&sp_cC=0000000000000000000000000000000000000000000000000000000000000010000110001001001000000000000000100111001000000000110000111011000010001001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&sp_cCO=010000000000000000000000000&sp_CommuneCounty=586&sp_Commune=18419&sp_Info=&sp_P=0&sp_Coord[W]=11.509840183125&sp_Coord[S]=48.047729754841&sp_Coord[E]=11.527809635057&sp_Coord[N]=48.065699206773&sp_AltitudeFrom=-19&sp_AltitudeTo=2962&sp_CommentValue=&sp_OnlyAH=0&sp_Ats=-00000&sp_project=&sp_FChoice=list&sp_FDisplay=DATE_PLACE_SPECIES&sp_DFormat=DESC&sp_FOrderListSpecies=SYSTEMATIC&sp_FListSpeciesChoice=DATA&sp_DateSynth=${today}&sp_FOrderSynth=ALPHA&sp_FGraphChoice=DATA&sp_FGraphFormat=auto&sp_FAltScale=250&sp_FAltChoice=DATA&sp_FMapFormat=none&submit=Abfrage+starten&mp_item_per_page=60`;
  return URL;
}

const closeChrome = async (page, browser) => {
  console.log('Closing Chrome');
  page && (await page.close());
  browser && (await browser.close());
};


const scrapeData = async (usePubSub = true) => {
  let page = null;
  let browser = null;
  try {
    const pageOptions = {
      timeout: 0,
      waitUntil: 'domcontentloaded'
    };
    console.log('Starting scraping. Launching browser.')
    browser = await puppeteer.launch(PUPPETEER_OPTIONS);
    page = await browser.newPage();
    await page.on('console', obj => console.log(obj.text())); // Capture in-browser console logs
    await page.setDefaultNavigationTimeout(0);
    await page.setDefaultTimeout(0);
    await page.goto(getScrapeURL(), pageOptions);
    const scrapedData = await page.evaluate(() => {
      
      const isListHeader = item => item.className === 'listTop';
      const isLocation = item => item.className === 'listSubmenu';
      const isObservation = item => item.className === 'listObservation';
      
      const getLocation = item =>
        item !== null ? item.querySelector('a').innerText.trim() : '';
      const getReports = item => {
        let children = item.children;
        let reported = [];
        for (let item of children) {
          let obses = item.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr > td > span > b').innerHTML.trim();
          obses += ' (' + item.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(1) > span > span').innerHTML.trim() + ')'
          reported.push(obses);
        }
        return reported;
      }
      
      const result = {};
      let observationsList = null;
      const observationsListDOMElement = document.querySelector("#td-main-table > tbody > tr > td > div.listContainer");
      observationsListDOMElement !== null ? observationsList = observationsListDOMElement.children : observationsList = [];
      console.log('In-Browser: Nr observations in list ', observationsList.length);
      result.hits = [];
      let currentEntry = {};
      for (let item of observationsList) {
        if (isLocation(item))
          currentEntry.location = getLocation(item);
        if (isObservation(item)) {
          currentEntry.reports = getReports(item);
          result.hits.push(currentEntry);
          currentEntry = {}; // one entry done. Prep for next (if any)
        }
      }
      return result;
    });
    scrapedData.url = getScrapeURL();
    scrapedData.md5 = crypto.createHash('md5').update(JSON.stringify(scrapedData.hits)).digest("hex")
    scrapedData.runTimestamp = Date.now();
    scrapedData.reportDate = getTodayString();
    console.log(JSON.stringify(scrapedData));
    usePubSub ? await publishObservationsMessage(scrapedData) : console.log('Skipped publishing message');
    
  } catch (err) {
    console.error(err);
  } finally {
    await closeChrome(page, browser);
  }
};

exports.getObservations = async () => {
  return scrapeData(true);
};
