const fs = require('fs');
const Handlebars = require("handlebars");

const indexTemplateName = __dirname + '/index.handlebars';
const template = Handlebars.compile(fs.readFileSync(indexTemplateName, {encoding: 'utf8'}));

const trimSighting = sighting => {
  return sighting.split('(')[0].trim(); // TODO: Trim trailing 's' if more than one sighted "Red-necked Grebes (9)" --> Red-necked Grebe
}

const distinctSpeciesSightings = reportMsg => {
  let species = [];
  reportMsg.hits.forEach(entry => {
    entry.reports.forEach(sighting => {
      species.push(trimSighting(sighting));
    });
  });
  return [...new Set(species)].sort();
}

/**
 * Given a report message, render an HTML report and return it as a string.
 *
 * @param reportMsg
 * @return {string}
 */
const renderReport = reportMsg => {
  reportMsg.species = distinctSpeciesSightings(reportMsg);
  return template(reportMsg);
}

module.exports = {
  renderReport, // Public module API
  internal: {   // Make methods available for unit testing
    distinctSpeciesSightings,
    trimSighting
  }
}
