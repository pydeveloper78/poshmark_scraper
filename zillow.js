const gsjson = require('google-spreadsheet-to-json');
const puppeteer = require('puppeteer')
const mkdirp = require('mkdirp');
const cheerio = require('cheerio');

(async() => {
    const width = 1920;
    const height = 1080;
    const browser = await puppeteer.launch({
        args: [
            `--window-size=${ width },${ height }`,
            '--proxy-server=zproxy.lum-superproxy.io:22225'
        ],
        headless: false
    });
    const page = await browser.newPage();
    page.authenticate({
        username: 'lum-customer-hl_f6570114-zone-static-country-us',
        password: 'tlmgc8x07nd6',
    })
    await page.setViewport({ width, height })
    await page.goto("https://www.zillow.com/homes/recently_sold/08001_rb/24m_days/", { waitUntil: 'domcontentloaded' });

    console.log(jsonData);
})();