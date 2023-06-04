import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { searchPhoneNumbersInText } from 'libphonenumber-js';

export async function browseWebPage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let content;

    try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
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
