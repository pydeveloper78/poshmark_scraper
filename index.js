const {User, Proxy} = require("./user");
const {Poshmark} = require("./poshmark");

async function initialize() {
    let user = new User();
    let proxy = new Proxy();
    let poshmark = new Poshmark(user);
    poshmark.setProxy(proxy);
    return new Promise((resolve, reject) => {
        poshmark.signUp((err, data) => {
            if (err) {
                reject(err);
                return;
            }

            data.saveUser((err) => {
                console.log(err);
            });
            resolve(data);
        });
    });
}

async function signUp() {
    await initialize()
        .then((data) => {
            console.log(data);
            // data.saveUser();
        })
        .catch((error) => {
            console.log(error);
        });
}

// function logIn (username) {
//     let user = new User(username);
//     if (!user) {
//         console.log("This user doesn't exist!");
//         return false;
//     }
//     let proxy = new Proxy();
//     proxy.set(user.proxy);
//     user.proxy = proxy;
//     let poshmark = new Poshmark(user);
//     poshmark.setProxy(proxy);
//     return new Promise((resolve, reject) => {
//         poshmark.logIn((err, data) => {

//         });
//     });
// }

function main(){
    let count = 3; // you can change this number to create multiple users at a time.
    let promises = [];
    for (let i =0;i<count;i++)
        promises.push(signUp());

    Promise.all(promises).then(() => {
        console.log('done');
    });
}

main();