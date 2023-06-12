import { getURLs } from '../../utils/metaphor.js';
// import { reverseLookupOffEmails } from '../../utils/reverse-lookup.js';
import {
    browseWebPage,
    findPhoneNumbersAndEmails,
} from '../../utils/scraping.js';

// FUNCTION FOR TESTING
// const debounce = (fn, delay) => {
//     let timer;
//     return function () {
//         const context = this,
//             args = arguments;
//         clearTimeout(timer);
//         timer = setTimeout(() => fn.apply(context, args), delay);
//     };
// };

export default async function handler(req, res) {
    const start = performance.now();
    const { query, number } = req.query;
    console.log(query);
    console.log(number);

    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }
    function removeDuplicates(phoneNumbers) {
        const uniquePhoneNumbers = [...new Set(phoneNumbers)];
        return uniquePhoneNumbers;
    }

    const arrayOfPromptResults = await getURLs(query, number);
    const dataPromises = arrayOfPromptResults
        .filter((result) => result !== undefined)
        .map(async ({ urls, metaphorSearchPrompt }) => {
            return Promise.all(
                urls.map(async (url) => {
                    const text = await browseWebPage(url);
                    const { phoneNumbers, emails } =
                        await findPhoneNumbersAndEmails(text);
                    console.log('Phone Numbers: ', phoneNumbers);

                    // const reverseLookupNumbers =
                    //     reverseLookupOffEmails(uniqueEmails);

                    return {
                        metaphorPrompt: metaphorSearchPrompt,
                        url: url,
                        phoneNumbers: removeDuplicates(phoneNumbers),
                        emails: removeDuplicates(emails),
                        // reverseLookupNumbers: reverseLookupNumbers,
                    };
                })
            );
        });

    const data = await Promise.all(dataPromises).then((res) => res.flat());
    console.log(data);

    console.log(`\nSearch took ${performance.now() - start} milliseconds.`);

    return res.json(data);
}
