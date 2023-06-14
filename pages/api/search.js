import puppeteer from 'puppeteer';
import { getURLs } from '../../utils/metaphor.js';
import {
  browseWebPage,
  findPhoneNumbersAndEmails,
} from '../../utils/scraping.js';

function removeDuplicates(phoneNumbers) {
  const uniquePhoneNumbers = [...new Set(phoneNumbers)];
  return uniquePhoneNumbers;
}

export default async function handler(req, res) {
  const start = performance.now();
  const { query, number } = req.query;
  console.log(query);
  console.log(number);
  
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const arrayOfPromptResults = await getURLs(query, number);
  const dataPromises = arrayOfPromptResults
    .filter((result) => result !== undefined)
    .map(async ({ urls, metaphorSearchPrompt }) => {
      const data = await Promise.all(
        urls.map(async (url) => {
          const text = await browseWebPage(url);
          const { phoneNumbers, emails } = await findPhoneNumbersAndEmails(text);
          console.log('Phone Numbers:', phoneNumbers);
          return {
            metaphorPrompt: metaphorSearchPrompt,
            url,
            phoneNumbers: removeDuplicates(phoneNumbers),
            emails: removeDuplicates(emails),
          };
        })
      );
      return data;
    });
  
  const results = await Promise.all(dataPromises);
  const data = results.flat();
  console.log(data);
  console.log(`\nSearch took ${performance.now() - start} milliseconds.`);
  return res.json(data);
}
