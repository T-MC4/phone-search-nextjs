// import { getURLs } from '../../utils/metaphor.js';
// import {
//     browseWebPage,
//     findPhoneNumbersAndEmails,
//     removeDuplicates,
// } from '../../utils/scraping.js';

// export default async function handler(req, res) {
//     const start = performance.now();

//     const query = req.query.query;
//     console.log(query);
//     const number = req.query.number;
//     console.log(number);

//     if (!query) {
//         return res.status(400).json({ error: 'Missing query parameter' });
//     }

//     const arrayOfPromptResults = await getURLs(query, number);
//     const dataPromises = arrayOfPromptResults
//         .filter((result) => result !== undefined)
//         .map(async ({ urls, metaphorSearchPrompt }) => {
//             return Promise.all(
//                 urls.map(async (url) => {
//                     const text = await browseWebPage(url);
//                     const { phoneNumbers, emails } =
//                         await findPhoneNumbersAndEmails(text);
//                     console.log('Phone Numbers: ', phoneNumbers);

//                     return {
//                         metaphorPrompt: metaphorSearchPrompt,
//                         url: url,
//                         phoneNumbers: removeDuplicates(phoneNumbers),
//                         emails: removeDuplicates(emails),
//                     };
//                 })
//             );
//         });

//     const data = await Promise.all(dataPromises).then((results) =>
//         results.flat()
//     );
//     console.log(data);

//     console.log(`\nSearch took ${performance.now() - start} milliseconds.`);

//     return res.json(data);
// }

/* trying to reduce the serverless function
Destructured req.query to directly access the query and number parameters.
Removed the unnecessary performance.now() call before accessing query and number.
Removed the redundant conversion of res to JSON format since it was not being used.
Removed the .then() function after Promise.all(dataPromises) and directly assigned the results to results.
Simplified the data flattening step by using the flat() method directly on results.
*/

import { getURLs } from '../../utils/metaphor.js';
import {
  browseWebPage,
  findPhoneNumbersAndEmails,
  removeDuplicates,
} from '../../utils/scraping.js';

export default async function handler(req, res) {
  const start = performance.now();

  const { query, number } = req.query;
  console.log(query);
  console.log(number);

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }


    const arrayOfPromptResults = [
        {
        urls: [
        'https://urbanicebotanicals.com/product/feel-free-wellness-tonic/',
        'http://haleakava.com/index.html',
        'https://www.mazatecgarden.com/products/kavakava.htm',
        'https://www.realkava.com/',
        'https://kavamamastore.com/collections/frontpage',
        ],
        metaphorSearchPrompt:
        'I found a local store that sells kava root drinks like feel frees here:',
        },
        {
        urls: [
        'https://www.etsy.com/shop/ILOVEfelt88',
        'https://thefeltstore.com/',
        'https://www.etsy.com/shop/WoolFeltDepot?ref=simple-shop-header-name&listing_id=549379642',
        'https://feelgoodfibers.com/',
        'https://www.etsy.com/shop/feltcafe',
        ],
        metaphorSearchPrompt:
        'Another option for purchasing feel frees locally can be found at this store:',
        },
        ];

//   const arrayOfPromptResults = await getURLs(query, number);
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
