import React, { useState } from 'react';

export default function ChatInterface() {
    // create a piece of state
    const [loading, setLoading] = useState(false);

    // Function to add a message to the chat interface
    const addMessage = (message) => {
        const messagesDiv = document.getElementById('messages');
        const newMessageDiv = document.createElement('pre');
        newMessageDiv.innerText = message;
        messagesDiv.appendChild(newMessageDiv);
    };

    // Function to send a query to the server and handle the response
//     const sendQuery = () => {
//         setLoading(true);

//         const queryInput = document.getElementById('query-input');
//         const query = queryInput.value.trim();

//         const numberInput = document.getElementById('number-input');
//         const number = numberInput.value;

//         if (!query) return;

//         // Make a request to the API endpoint
//         fetch(
//             `/api/search?query=${encodeURIComponent(
//                 query
//             )}&number=${encodeURIComponent(number)}`
//         )
//             .then((response) => response.json())
//             .then((data) => {
//                 // Process the response data and display phone numbers
//                 if (data.error) {
//                     addMessage(`Error: ${data.error}`);
//                 } else if (data.length === 0) {
//                     addMessage('No phone numbers found.');
//                 } else {
//                     // const phoneNumbers = data.map((result) => result).flat();
//                     // const formattedPhoneNumbers = phoneNumbers.join(', ');
//                     addMessage(JSON.stringify(data, null, 2));
//                 }
//             })
//             .catch((error) => {
//                 console.error('Error:', error);
//                 addMessage('An error occurred. Please try again.');
//             })
//             .finally(() => {
//                 setLoading(false);
//             });

//         // Clear the input field
//         queryInput.value = '';
//         numberInput.value = '';
//     };

    const sendQuery = () => {
    setLoading(true);

    const queryInput = document.getElementById('query-input');
    const query = queryInput.value.trim();

    const numberInput = document.getElementById('number-input');
    const number = numberInput.value;

    if (!query) return;

    // Make a request to the API endpoint
    fetch(
        `/api/search?query=${encodeURIComponent(query)}&number=${encodeURIComponent(
            number
        )}`
    )
        .then((response) => response.json())
        .then((data) => {
            // Process the response data and display phone numbers
            if (data.error) {
                addMessage(`Error: ${data.error}`);
            } else if (data.length === 0) {
                addMessage('No phone numbers found.');
            } else {
                // const phoneNumbers = data.map((result) => result).flat();
                // const formattedPhoneNumbers = phoneNumbers.join(', ');
                addMessage(JSON.stringify(data, null, 2));
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            addMessage(`An error occurred: ${error}`);
        })
        .finally(() => {
            setLoading(false);
        });

    // Clear the input field
    queryInput.value = '';
    numberInput.value = '';
};

    return (
        <div>
            <div id="chat-container">
                ...
                {loading && <p>Loading...</p>}
                <div id="input-container">
                    <input
                        type="text"
                        id="query-input"
                        placeholder="Enter your query"
                    />
                    <input
                        type="text"
                        id="number-input"
                        placeholder="# of prompts (1 = 5urls)"
                    />
                    <button id="send-button" onClick={sendQuery}>
                        Send
                    </button>
                </div>
                <div id="messages"></div>
            </div>
            ...
            <script
                dangerouslySetInnerHTML={{
                    __html: `
        // Attach event listeners
        const sendButton = document.getElementById("send-button");
        sendButton.addEventListener("click", sendQuery);
        const queryInput = document.getElementById("query-input");
        queryInput.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            sendQuery();
          }
        });
      `,
                }}
            />
        </div>
    );
}
