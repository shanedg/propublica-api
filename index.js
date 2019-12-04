const axios = require('axios');
const fs = require('fs');
const { parse } = require('json2csv');

const base = 'https://projects.propublica.org/nonprofits/api/v2/search.json';
const queryMassachusetts = `state${encodeURIComponent('[id]')}=MA`;
let page = 0;
let allResults = [];
let totalPages;

const sleep = async () => new Promise((resolve, reject) => {
  const sleepForMs = 2000;
  setTimeout(() => {
    console.log(`sleeping for ${sleepForMs}ms`);
    resolve();
  }, sleepForMs);
});

const main = async () => {
  do {
    const endpoint = `${base}?${queryMassachusetts}&page=${page}`;

    // Avoid API rate limiting
    await sleep();

    await axios.get(endpoint)
      .then((response) => {
        allResults.push(...response.data.organizations);
        console.log(`page ${page} of ${response.data.num_pages}`);
        console.log(`results so far ${allResults.length}`);

        if (!totalPages) {
          totalPages = response.data.num_pages;
        }
      })
      .catch(err => {
        console.error(`problem GETing ${err}`);
      });

    page += 1;

  } while(page < totalPages);

  console.log(`received ${allResults.length}`);
  const fields = ['ein', 'strein', 'name', 'sub_name', 'city', 'state', 'ntee_code', 'raw_ntee_code', 'subseccd', 'has_subseccd', 'have_filings', 'have_extracts', 'have_pdfs', 'score'];
  const opts = { fields };

  try {
    const csv = parse(allResults, opts);
    const streamfile = fs.createWriteStream('./out.csv', { encoding: 'utf-8'});
    streamfile.write(csv);

  } catch (err) {
    console.error(`oops! ${err}`);
  }

}

main();