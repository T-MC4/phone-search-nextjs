// Import the fetch function from node-fetch module
import fetch from 'node-fetch';
// import fs from 'fs/promises';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

export async function getURLs(request, breadth) {
    const template = `You work with an assistant that will make calls in order to complete user requests. 
        
    Here is the user's request: {userRequest}
    
    The assistant can only complete this request if they get the phone number of the right person/store/employee/represenative.
    
    The assistant asks their genius friend to help them find the number they should call. After determining whether the user was trying to purchase or research, the genius friend sent a response. 
    
    Here are examples of the genius' past responses:
    
    "You can find all of Shakespeare's works on this site:"
    "I found a comprehensive guide to organic gardening here:"
    "This is an excellent website to learn coding for beginners:"
    "If you're interested in DIY crafts, this blog is a must-visit:"
    "This page contains a wealth of information about the history of jazz music:"
    "One of the most inspiring TED talks I've seen is on this page:"
    "For those interested in space exploration, this NASA link is worth checking out:"
    "This link leads to a comprehensive database of all the bird species in North America:"
    "For an in-depth analysis of World War II, refer to this site:"
    "This is the best site I've found for learning French online:"
    "A detailed and fascinating journey through Egyptian history can be found here:"
    "This link leads to an interactive world map for climate data:"
    "You'll find the best vegetarian recipes on this site:"
    "If you're a fan of classic literature, you'll appreciate this online library:"
    "This is my favorite site to follow the latest tech gadgets:"
    "The most insightful documentary on climate change is here:"
    "Here's a fantastic resource for learning more about quantum physics:"
    "This link contains a well-curated list of must-read philosophy books:"
    "For an interesting insight into AI and its implications, refer to this blog:"
    "A comprehensive guide to yoga and meditation can be found at this link:"
    
    The genius always points to websites with 'contact us' information. What did the genius send the assistant? Output your {numOfPrompts} best guesses in a javascript array:`;

    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4',
        temperature: 0,
    });
    const prompt = new PromptTemplate({
        template: template,
        inputVariables: ['userRequest', 'numOfPrompts'],
    });
    const chain = new LLMChain({ llm: llm, prompt: prompt });

    const metaphorSearchPrompts = await chain.call({
        userRequest: request,
        numOfPrompts: breadth,
    });
    console.log(metaphorSearchPrompts);

    const url = 'https://api.metaphor.systems/search';

    const queriesPromises = JSON.parse(metaphorSearchPrompts.text).map(
        async (metaphorSearchPrompt) => {
            const data = {
                query: metaphorSearchPrompt,
                numResults: 5,
                useQueryExpansion: false,
            };

            const options = {
                method: 'POST',
                headers: {
                    accept: 'text/plain',
                    'content-type': 'application/json',
                    'x-api-key': process.env.METAPHOR_API_KEY, // Replace with your actual API key
                },
                body: JSON.stringify(data),
            };

            try {
                const response = await fetch(url, options);
                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);

                const text = await response.text();
                console.log(text);

                const data = JSON.parse(text);
                const urls = data.results.map((result) => result.url);
                console.log(urls);

                // await fs.writeFile('./utils/logs.json', JSON.stringify(urls));
                return {
                    urls,
                    metaphorSearchPrompt,
                };
            } catch (err) {
                console.error('Error: ', err);
            }
        }
    );

    const searchQueries = await Promise.all(queriesPromises);
    return searchQueries;
}

// export async function getURLs(request, breadth) {

//     // Transorm user requests into Metaphor Search prompts
//     const llm = new ChatOpenAI({
//         apiKey: process.env.OPENAI_API_KEY,
//         modelName: 'gpt-4',
//         temperature: 0,
//     });
//     const prompt = new PromptTemplate({
//         template: template,
//         inputVariables: ['userRequest', 'numOfPrompts'],
//     });
//     const chain = new LLMChain({ llm: llm, prompt: prompt });

//     const metaphorSearchPrompts = await chain.call({
//         userRequest: request,
//         numOfPrompts: breadth,
//     });
//     console.log(metaphorSearchPrompts);

//     const url = 'https://api.metaphor.systems/search';

//     const searchQueries = [];

//     for (let metaphorSearchPrompt of JSON.parse(metaphorSearchPrompts.text)) {
//         const data = {
//             query: metaphorSearchPrompt,
//             numResults: 5,
//             useQueryExpansion: false,
//         };

//         const options = {
//             method: 'POST',
//             headers: {
//                 accept: 'text/plain',
//                 'content-type': 'application/json',
//                 'x-api-key': process.env.METAPHOR_API_KEY, // Replace with your actual API key
//             },
//             body: JSON.stringify(data),
//         };

//         try {
//             const response = await fetch(url, options);
//             if (!response.ok)
//                 throw new Error(`HTTP error! status: ${response.status}`);

//             const text = await response.text();
//             console.log(text);

//             const data = JSON.parse(text);
//             const urls = data.results.map((result) => result.url);
//             console.log(urls);

//             await fs.writeFile('./utils/logs.json', JSON.stringify(urls));
//             searchQueries.push({
//                 urls,
//                 metaphorSearchPrompt,
//             });
//         } catch (err) {
//             console.error('Error: ', err);
//         }
//     }

//     return searchQueries;
// }

// const urls = await getURLs(
//     "I need some feel frees. They're like a kava root drink. Can you order me some? I need them in the next few hours so we probably have to search for them locally instead of ordering online",
//     5
// );
// console.log(urls);
