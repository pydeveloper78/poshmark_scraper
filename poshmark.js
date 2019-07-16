const puppeteer = require('puppeteer');

const P_SITEURL = 'https://poshmark.com';
const P_LOGIN_URI = '/login';
const P_SIGNUP_URI = '/signup';
const P_PROFILE_URI = '/set-profile-info';
const P_FOLLOW_BRAND_URI = '/on/follow-brands';
const P_FASION_NETWORK_URI = '/your-fashion-network';
const P_FEED_URI = '/feed';

const _exports = {
    P_SITEURL,
    P_LOGIN_URI,
    P_SIGNUP_URI,
    P_PROFILE_URI,
    P_FOLLOW_BRAND_URI,
    P_FASION_NETWORK_URI,
    P_FEED_URI
}

_exports.Poshmark = class Poshmark {
    constructor (user) {
        this.user = user;
        this.proxy = null;
    }

    updateUser(user) {
        this.user = user;
    }

    async logIn() {
        // Login processing
    }

    async setProxy(proxy) {
        this.proxy = proxy;
    }

    async signUp(callback) {

        if (this.proxy) {
            this.browser = await puppeteer.launch({headless: false, args: [`--proxy-server=${this.proxy.host}`,'--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true});
            this.page = await this.browser.newPage();
            if (this.proxy.user) {
                await this.page.authenticate({username: this.proxy.user, password: this.proxy.pass});
            }
        } else {
            this.browser = await puppeteer.launch({headless: false});
            this.page = await this.browser.newPage();
        }
        
        await this.page.setViewport({width: 1200, height: 800});
        await this.page.goto(`${P_SITEURL}${P_SIGNUP_URI}`, {waitUntil: 'networkidle2'})
        await this.enterUserInfo();
        await this.isSigned(async(err) => {
            if (err) {
                await this.end();
                callback(err, null);
            } else {
                const logoSelector = 'body > header > div > a';
                await this.simulateMouse(logoSelector);
                const cookies = await this.page.cookies()
                this.user.cookies = cookies;
                this.user.proxy = this.proxy;
                await this.end();
                callback(null, this.user);
            }
        });
    }
    async isSigned (callback) {
        await this.page.waitFor(() => 
            document.querySelectorAll('span.field_with_error, span.base_error_message, form#new_user_profile_form').length
        );
        await this.page.waitFor(2000);
        try{
            const fieldErrors = await this.page.$eval('span.field_with_error', el => el.textContent);
            callback(fieldErrors);
            // callback('FIELD_WITH_ERROR');
            return;
        }
        catch (e) {
            // console.log('NOT FOUND FILED ERROR MESSAGE');
        }
        try {
            const basicError = await this.page.$eval('span.base_error_message', el => el.textContent);
            callback(basicError);
            // callback('BASE_ERROR_MESSAGE');
            return;
        }
        catch (e) {
            // console.log('NOT FOUND BASE ERROR MESSAGE');
        }
        try {
            const newFormSelector = await this.page.$eval('form#new_user_profile_form', el => el.id);
            callback(null);
            return;
        }
        catch (e) {
            callback('ERROR_TIMEOUT');
            return;
        }
    }

    async enterUserInfo () {
        const firstNameSelector = '#sign_up_form_first_name';
        await this.simulateKeyboard(firstNameSelector, this.user.firstname);
        const lastNameSelector = '#sign_up_form_last_name';
        await this.simulateKeyboard(lastNameSelector, this.user.lastname);
        const emailSelector = '#sign_up_form_email';
        await this.simulateKeyboard (emailSelector, this.user.email);
        const usernameSelector = '#sign_up_form_username';
        await this.simulateKeyboard (usernameSelector, this.user.username);
        const passwordSelector = '#sign_up_form_password';
        await this.simulateKeyboard (passwordSelector, this.user.password);
        const genderSelector = '#sign_up_form_gender';
        await this.simulateKeyboard (genderSelector, this.user.gender);
        const signUpSeletor = 'input[name="commit"]';
        await this.simulateMouse(signUpSeletor);
    }

    async simulateMouse(selector) {
        await this.page.waitFor(1000);
        await this.page.waitForSelector(selector);
        await this.page.click(selector);
        await this.page.waitFor(3000);
    }

    async simulateKeyboard(selector, value) {
        await this.page.waitForSelector(selector);
        await this.page.click(selector, {clickCount: 3});
        await this.page.$eval(selector, el => el.value = '');

        for (let i=0; i<value.length; i++) {
            await this.page.type(selector, value[i]);
            await this.page.waitFor(50);
        }
        await this.page.waitFor(1000);
    }
    
    async end() {
        await this.browser.close();
    }
}

module.exports = _exports;