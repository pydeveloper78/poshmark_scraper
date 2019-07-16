const Fakerator = require("fakerator");
// import Fakerator from "fakerator";
const fs = require('fs');
// import fs from 'fs';
const lockFile = require('lockfile');

const P_GENDER_MALE = 'MALE';
const P_GENDER_FEMALE = 'FEMALE';
const P_GENDER_UNSPECIFIED = 'UNSPECIFIED';


const _exports = {
    P_GENDER_MALE,
    P_GENDER_FEMALE,
    P_GENDER_UNSPECIFIED
}

_exports.Proxy = class Proxy {
    constructor (current_proxy = null) {
        this.proxy = null;
        while (this.proxy == current_proxy || this.proxy == '') {
            this.randomProxy();
        }
    }
    randomProxy() {
        const proxies = fs.readFileSync('proxies.txt', 'utf8').split('\n');
        this.proxy = proxies[Math.floor(Math.random() * proxies.length)];
        this.user = this.proxy.split(':')[2];
        this.pass = this.proxy.split(':')[3];
        this.host = `http://${this.proxy.split(':')[0]}:${this.proxy.split(':')[1]}`;
        // this.user = this.proxy.split('@')[0].replace(/http[s]?\:\/\//g, '').split(':')[0];
        // this.pass = this.proxy.split('@')[0].replace(/http[s]?\:\/\//g, '').split(':')[1];
        // this.host = this.proxy.replace(`${this.user}:${this.pass}@`, '');
    }

    set(proxy) {
        if (proxy) {
            this.proxy = proxy.proxy;
            this.user = proxy.user;
            this.pass = proxy.pass;
            this.host = proxy.host;
        }
    }
}

_exports.User = class User {
    constructor (email=null) {
        if (email === null) {
            this.randomUser();
        } else {
            this.loadUser(email);
        }
    }

    randomUser() {
        let fakerator = Fakerator();
        let user = null;
        if (Math.random() > 0.5) {
            this.gender = P_GENDER_MALE;
            user = fakerator.entity.user("M");
        } else {
            this.gender = P_GENDER_FEMALE;
            user = fakerator.entity.user("F");
        }
        // this.email = user.email.split('@')[0] + '@gmail.com';
        this.email = user.email;
        this.username = `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}${fakerator.random.masked("999")}`.substr(0,15);
        this.firstname = user.firstName;
        this.lastname = user.lastName;
        this.password = fakerator.internet.password(8) + fakerator.random.hex(8);
        this.cookies = null;
        this.proxy = null;
        console.log(this)
    }

    loadUser(username) {
        if (fs.existsSync(`users/${username}.json`)) {
            let user = JSON.parse(fs.readFileSync(`users/${username}.json`, 'utf8'));

            this.email = user.email;
            this.username = user.username;
            this.password = user.password;
            this.firstname = user.firstname;
            this.lastname = user.lastname;
            this.gender = user.gender;
            this.cookies = user.cookies;
            this.proxy = user.proxy;
        } else {
            this.email = null;
            this.username = null;
            this.password = null;
            this.firstname = null;
            this.lastname = null;
            this.gender = null;
            this.cookies = null;
            this.proxy = null;
        }

        return this.getUserJson();
    }

    getUserJson() {
        return {
            username: this.username, 
            email: this.email, 
            firstname: this.firstname, 
            lastname: this.lastname, 
            gender: this.gender, 
            password: this.password,
            cookies: this.cookies,
            proxy: this.proxy
        }
    }

    saveUser(callback) {
        // const jsonUser = JSON.stringify(this.getUserJson());
        // fs.writeFileSync(`users/${this.username}.json`, jsonUser);
        const userinfo = `${this.username}:${this.password}\n`;
        lockFile.lock('foo.lock', function(err) {
            if (err) {
                return callback(err);
            }
            fs.appendFile('users.txt', userinfo, 'utf8', callback);
            lockFile.unlock('foo.lock')
        });
    }

}

module.exports = _exports;