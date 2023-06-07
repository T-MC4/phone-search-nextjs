const cheerio = require('cheerio');
const { searchPhoneNumbersInText } = require('libphonenumber-js');
// import puppeteer from 'puppeteer';
// import * as puppeteer from 'puppeteer';
// import chromium from 'chrome-aws-lambda';

export async function browseWebPage(url) {
    let puppeteer;
    let options;

    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        // running on the Vercel platform.
        chrome = require('chrome-aws-lambda');
        puppeteer = require('puppeteer-core');
        options = {
            args: [
                ...chrome.args,
                '--hide-scrollbars',
                '--disable-web-security',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
            ignoreDefaultArgs: ['--disable-extensions'],
        };
    } else {
        // running locally.
        puppeteer = require('puppeteer');
        options = { args: ['--no-sandbox'] };
    }

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    // let browser = await puppeteer.launch(options);
//     const browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();
    let content;

    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        content = await page.content();
    } catch (error) {
        console.log(
            `Failed to load or process page: ${url} due to ${error.message} - substituting with empty text for speed`
        );
        return '';
    } finally {
        await browser.close();
    }

    return content;
}

export function removeDuplicates(phoneNumbers) {
    const uniquePhoneNumbers = [...new Set(phoneNumbers)];
    return uniquePhoneNumbers;
}

export async function findPhoneNumbersAndEmails(html) {
    const $ = cheerio.load(html);

    // Getting the text from the HTML
    let text = $('body').text();

    let phoneNumbers = [];

    for (const number of searchPhoneNumbersInText(text, 'US')) {
        console.log('Phone Number', number);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
            phoneNumbers.push(number.number.number);
        });
    }
    console.log('Finished');

    let commonDomains = [
        '.com',
        '.org',
        '.net',
        '.gov',
        '.edu',
        '.io',
        '.ai',
        '.co',
        '.me',
    ];
    let matches =
        text.match(
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(?<!\.jpg|\.png|\.jpeg|\.gif)\.[A-Z|a-z]{2,}\b/g
        ) || [];
    let emails = matches.filter((email) =>
        commonDomains.some((domain) => email.includes(domain))
    );

    return {
        phoneNumbers: phoneNumbers || 'None',
        emails: emails,
    };
}

// const content = await browseWebPage('http://haleakava.com/index.html');
// const { phoneNumbers, emails } = await findPhoneNumbersAndEmails('text');
// console.log(phoneNumbers);
// console.log(emails);


// const cheerio = require('cheerio');
// const { searchPhoneNumbersInText } = require('libphonenumber-js');
// const puppeteer = require('puppeteer');
// const chromium = require('chrome-aws-lambda');

// export async function browseWebPage(url) {
//   let options;

//   if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
//     // Running on the AWS Lambda platform.
//     const chrome = await chromium.puppeteer.launch({
//       args: chromium.args,
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath,
//       headless: true,
//       ignoreHTTPSErrors: true,
//     });

//     options = { browser: chrome };
//   } else {
//     // Running locally.
//     options = { browser: await puppeteer.launch({ headless: true }) };
//   }

//   const { browser } = options;
//   const page = await browser.newPage();
//   let content;

//   try {
//     await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
//     content = await page.content();
//   } catch (error) {
//     console.log(`Failed to load or process page: ${url} due to ${error.message} - substituting with empty text for speed`);
//     return '';
//   } finally {
//     await browser.close();
//   }

//   return content;
// }

// export function removeDuplicates(phoneNumbers) {
//   const uniquePhoneNumbers = [...new Set(phoneNumbers)];
//   return uniquePhoneNumbers;
// }

// export async function findPhoneNumbersAndEmails(html) {
//   const $ = cheerio.load(html);

//   // Getting the text from the HTML
//   let text = $('body').text();

//   let phoneNumbers = [];

//   for (const number of searchPhoneNumbersInText(text, 'US')) {
//     console.log('Phone Number', number);
//     await new Promise((resolve) => {
//       setTimeout(resolve, 0);
//       phoneNumbers.push(number.number.number);
//     });
//   }
//   console.log('Finished');

//   let commonDomains = [
//     '.com',
//     '.org',
//     '.net',
//     '.gov',
//     '.edu',
//     '.io',
//     '.ai',
//     '.co',
//     '.me',
//   ];
//   let matches =
//     text.match(
//       /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(?<!\.jpg|\.png|\.jpeg|\.gif)\.[A-Z|a-z]{2,}\b/g
//     ) || [];
//   let emails = matches.filter((email) =>
//     commonDomains.some((domain) => email.includes(domain))
//   );

//   return {
//     phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : 'None',
//     emails: emails,
//   };
// }

// export async function processWebPage(url) {
//   try {
//     const html = await browseWebPage(url);
//     const { phoneNumbers, emails } = await findPhoneNumbersAndEmails(html);
//     console.log('Phone Numbers:', phoneNumbers);
//     console.log('Emails:', emails);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// Usage Example
// processWebPage('http://example.com');


// In this updated version, the code includes the following changes:

// Updated Puppeteer Imports: The code now imports puppeteer and chrome-aws-lambda directly and avoids the commented-out import statements.

// Environment Variable Check: The code checks the AWS_LAMBDA_FUNCTION_VERSION environment variable to determine the platform and uses the appropriate configuration for launching Puppeteer.

// Await `chromium
