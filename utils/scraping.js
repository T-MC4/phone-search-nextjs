const cheerio = require('cheerio');
const { searchPhoneNumbersInText } = require('libphonenumber-js');
//` import puppeteer from 'puppeteer';
// import * as puppeteer from 'puppeteer';
// import chromium from 'chrome-aws-lambda';
const puppeteer = require('puppeteer'); 

// let puppeteer; 
let options;

process.setMaxListeners(15);

async function browseWebPage(url) {
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        // running on the Vercel platform.
        chrome = require('chrome-aws-lambda');
        // puppeteer = require('puppeteer-core');
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
        // puppeteer = require('puppeteer');
        options = { args: ['--no-sandbox'] };
    }
    
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new' });
  const page = await browser.newPage();
  let content;
    
try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 300000 });
    content = await page.content();
  } catch (error) {
    console.log(`Failed to load or process page: ${url} due to ${error.message}`);
    return '';
  } finally {
    await browser.close();
  }
  return content;
}

async function findPhoneNumbersAndEmails(html) {
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
      text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(?<!\.jpg|\.png|\.jpeg|\.gif)\.[A-Z|a-z]{2,}\b/g) || [];
    let emails = matches.filter((email) =>
      commonDomains.some((domain) => email.includes(domain))
    );
    return {
        phoneNumbers: phoneNumbers || 'None',
        emails: emails,
      };
    }
    
    module.exports = {
      browseWebPage,
      findPhoneNumbersAndEmails,
    };
