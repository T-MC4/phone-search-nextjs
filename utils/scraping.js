// const cheerio = require('cheerio');
// const { searchPhoneNumbersInText } = require('libphonenumber-js');
// // import puppeteer from 'puppeteer';
// // import * as puppeteer from 'puppeteer';
// // import chromium from 'chrome-aws-lambda';

// process.setMaxListeners(15);

// export async function browseWebPage(url) {
//     let puppeteer;
//     let options;

//     if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
//         // running on the Vercel platform.
//         chrome = require('chrome-aws-lambda');
//         puppeteer = require('puppeteer-core');
//         options = {
//             args: [
//                 ...chrome.args,
//                 '--hide-scrollbars',
//                 '--disable-web-security',
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//             ],
//             defaultViewport: chrome.defaultViewport,
//             executablePath: await chrome.executablePath,
//             headless: true,
//             ignoreHTTPSErrors: true,
//             ignoreDefaultArgs: ['--disable-extensions'],
//         };
//     } else {
//         // running locally.
//         puppeteer = require('puppeteer');
//         options = { args: ['--no-sandbox'] };
//     }

//     const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new' });
//     // let browser = await puppeteer.launch(options);

//     const page = await browser.newPage();
//     let content;

//     try {
//         await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
//         content = await page.content();
//     } catch (error) {
//         console.log(
//             `Failed to load or process page: ${url} due to ${error.message} - substituting with empty text for speed`
//         );
//         return '';
//     } finally {
//         await browser.close();
//     }

//     return content;
// }

// export function removeDuplicates(phoneNumbers) {
//     const uniquePhoneNumbers = [...new Set(phoneNumbers)];
//     return uniquePhoneNumbers;
// }

// export async function findPhoneNumbersAndEmails(html) {
//     const $ = cheerio.load(html);

//     // Getting the text from the HTML
//     let text = $('body').text();

//     let phoneNumbers = [];

//     for (const number of searchPhoneNumbersInText(text, 'US')) {
//         console.log('Phone Number', number);
//         await new Promise((resolve) => {
//             setTimeout(resolve, 0);
//             phoneNumbers.push(number.number.number);
//         });
//     }
//     console.log('Finished');

//     let commonDomains = [
//         '.com',
//         '.org',
//         '.net',
//         '.gov',
//         '.edu',
//         '.io',
//         '.ai',
//         '.co',
//         '.me',
//     ];
//     let matches =
//         text.match(
//             /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(?<!\.jpg|\.png|\.jpeg|\.gif)\.[A-Z|a-z]{2,}\b/g
//         ) || [];
//     let emails = matches.filter((email) =>
//         commonDomains.some((domain) => email.includes(domain))
//     );

//     return {
//         phoneNumbers: phoneNumbers || 'None',
//         emails: emails,
//     };
// }
import cheerio from 'cheerio';
import { searchPhoneNumbersInText } from 'libphonenumber-js';
import puppeteer from 'puppeteer';

export async function browseWebPage(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
  const page = await browser.newPage();
  let content;

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
    content = await page.content();
  } catch (error) {
    console.log(`Failed to load or process page: ${url} due to ${error.message} - substituting with empty text for speed`);
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
  const text = $('body').text();
  const phoneNumbers = [];

  for (const number of searchPhoneNumbersInText(text, 'US')) {
    console.log('Phone Number:', number);
    await new Promise((resolve) => {
      setTimeout(() => {
        phoneNumbers.push(number.number.number);
        resolve();
      }, 0);
    });
  }

  console.log('Finished');

  const commonDomains = [
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

  const matches = text.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(?<!\.jpg|\.png|\.jpeg|\.gif)\.[A-Z|a-z]{2,}\b/g
  ) || [];

  const emails = matches.filter((email) =>
    commonDomains.some((domain) => email.includes(domain))
  );

  return {
    phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : 'None',
    emails,
  };
}

export async function processWebPage(url) {
  try {
    const html = await browseWebPage(url);
    const { phoneNumbers, emails } = await findPhoneNumbersAndEmails(html);
    console.log('Phone Numbers:', phoneNumbers);
    console.log('Emails:', emails);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage Example
processWebPage('http://example.com');

