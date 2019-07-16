const gsjson = require('google-spreadsheet-to-json');
const puppeteer = require('puppeteer')
const mkdirp = require('mkdirp');
const buster = {
    argument: {
        "home_url": "https://www.zillow.com/homes/",
        "user": "raphael+upwork@prospectbird.com",
        "pass": "MadeMeAgoodPrice75",
        "datasheet": "11tY0RL3YHd33WaxD-LM2yOFQPadS3oQbrz2c2ResqwY"
    }
}


async function selectPage(options) {
    const result = await Promise.race(options.map((option, index) => wrapSelector(option, index)));
    return result;
}

async function checkLogin(selectorLoginFailed, selectorLoggedIn) {
    return (await selectPage([selectorLoginFailed, selectorLoggedIn])) == 1;
}

async function wrapSelector(selector, resultName) {
    await selector;
    return resultName;
}

;
(async() => {

    const width = 1360;
    const height = 720;

    const browser = await puppeteer.launch({
        args: [
            `--window-size=${ width },${ height }`
        ],
        // args: ["--no-sandbox"] // this is needed to run Puppeteer in a Phantombuster container
        headless: false
    })

    const username = buster.argument.user;
    const password = buster.argument.pass;
    const page = await browser.newPage()
    await page.setViewport({ width, height })

    await page.goto(buster.argument.home_url)
        // Login
    try {
        await page.waitForSelector('.login-body');
    } catch (e) {}

    await page.click('button');
    await page.waitForSelector('input[name="email"]');
    await page.waitFor(3000);
    await page.click('input[name="email"]', { clickCount: 3 });
    await page.keyboard.type(username);
    await page.click('input[name="password"]', { clickCount: 3 });
    await page.keyboard.type(password);
    // await page.waitFor(3000);
    await page.click('button.auth0-lock-submit', { clickCount: 3 });

    const loginResult = await checkLogin(
        page.waitForSelector('div.auth0-lock-error-msg span'),
        page.waitForSelector('img.mCS_img_loaded'),
    )

    if (loginResult) {
        console.log(`> Successfully Logged In as ${username}`);
    } else {
        console.log(`> Failed to Log In as ${username}`);
    }

    await page.screenshot({ path: 'screenshot.png' })

    const datasheetId = buster.argument.datasheet;
    const fields = await gsjson({
        spreadsheetId: datasheetId
    });
    for (let field of fields) {
        await page.click('input#txt_fullName', { clickCount: 3 })
        await page.keyboard.press('Backspace');
        field.name = field.name != undefined ? field.name : "";
        await page.keyboard.type(field.name)
        await page.click('input#txt_role', { clickCount: 3 })
        await page.keyboard.press('Backspace');
        field.role = field.role != undefined ? field.role : "";
        await page.keyboard.type(field.role)
        await page.click('input#txt_company', { clickCount: 3 })
        await page.keyboard.press('Backspace');
        field.company = field.company != undefined ? field.company : "";
        await page.keyboard.type(field.company)
        await page.click('input#dd_countryAutoComplete', { clickCount: 3 })
        await page.keyboard.press('Backspace');
        field.country = field.country != undefined ? field.country : ""
        await page.keyboard.type(field.country)
        await page.waitFor(1000);
        await page.click('div.search-btn button', { clickCount: 3 })
        await page.waitForSelector('.card-datatable')
        await page.waitFor(5000)
        const script_path = `./imgs/` + `image_${field.name.toLowerCase()}_${field.role.toLowerCase()}_${field.company.toLowerCase()}_${field.country.toLowerCase()}`.replace(/\W/g, '_');
        await mkdirp(script_path);
        while (true) {
            let i = await page.evaluate(() => document.querySelector('li.pages.active a').textContent.trim());
            await page.screenshot({ path: `${script_path}/${i}.jpg`, type: 'jpeg', fullPage: true });
            const isNext = await checkLogin(
                page.waitForSelector('li:not([class]) a[aria-label="go to next page"]'),
                page.waitForSelector('li.disabled a[aria-label="go to next page"]')
            )
            if (isNext) {
                break;
            }
            await page.click('li:not([class]) a[aria-label="go to next page"]', { clickCount: 3 })
            await page.waitFor(5000)
        }
    }

    await browser.close()

})();