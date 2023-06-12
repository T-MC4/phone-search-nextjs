import authClient from 'zoominfo-api-auth-client';
import fetch from 'node-fetch';

const USERNAME = process.env.ZOOMINFO_USERNAME;
const PASSWORD = process.env.ZOOMINFO_PASSWORD;

let authToken = '';

const authenticate = async () => {
    try {
        authToken = await authClient.getAccessTokenViaBasicAuth(
            USERNAME,
            PASSWORD
        );
        console.log('Authenticated successfully, JWT token is:', authToken);
    } catch (error) {
        console.log('Error while authenticating:', error);
    }
};

// Function to refresh the token every 55 minutes
const scheduleTokenRefresh = () => {
    setTimeout(async () => {
        await authenticate();
        scheduleTokenRefresh(); // Schedule the next refresh
    }, 55 * 60 * 1000); // Convert to milliseconds
};

authenticate().then(scheduleTokenRefresh);

export async function reverseLookupOffEmails(emails) {
    const url = 'https://api.zoominfo.com/enrich/contact';

    let phoneNumbers = [];
    for (let email of emails) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                outputFields: ['mobilePhone', 'phone'],
                matchPersonInput: [
                    {
                        emailAddress: email,
                    },
                ],
            }),
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            phoneNumbers.push(result);
            console.log(result);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    return phoneNumbers;
}
