// ==UserScript==
// @name         WhatsApp Web Quick Reply V2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  WhatsApp Web Quick Reply V2
// @author       Laksamadi Guko
// @icon         https://laksa19.github.io/WhatsApp-Web-Quick-Reply/favicon.png
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // JSON configuration for buttons and messages
    const quickReplyConfig = [
        {
            text: "halo",
            message: "Halo 👋"
        },
        {
            text: "thanks",
            message: "\nHai kakak,\nTerima kasih."
        }

        
    ];


    // Function to create and insert quick reply buttons
    function insertQuickReplyButtons() {

        // Check if the buttons already exist to avoid duplication
        if (document.getElementById('quickReplyButtonsContainer')) return;

        // Create a container for the buttons
        let container = document.createElement('div');
        container.id = 'quickReplyButtonsContainer';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '5px';
        container.style.padding = '10px 0 5px 0';
        container.style.justifyContent = 'center';
        container.style.background = '#202c33';
        container.style.borderLeft = 'solid 1px #2f3b43'

        // Create and append each button based on the JSON configuration
        quickReplyConfig.forEach(config => {

            let contactName = btoa(document.querySelector('#main header span[dir="auto"]').innerText);

            let link = document.createElement('div');
            link.title = config.message;
            link.innerText = config.text;
            link.style.padding = '5px';
            link.style.lineHeight = '20px';
            link.style.backgroundColor = '#00a884';
            link.style.color = 'white';
            link.style.border = 'none';
            link.style.borderRadius = '7px';
            link.style.cursor = 'pointer';
            link.style.verticalAlign = 'center';
            link.style.textAlign = 'center';
            link.style.minWidth = '35px';

            // Append the button to the container
            container.appendChild(link);

            link.addEventListener('click', function () {
                // Simulate sending the message
                sendMessage(config.message);
            });

        });

        // Find and prepend the container to the chat footer
        let footer = document.querySelector('footer');
        if (footer) {
            footer.prepend(container);
        } else {
            console.error("Footer not found");
        }
    }

    // Send message function
    function sendMessage(message) {

        const messageBox = document.querySelectorAll('[contenteditable="true"]')[1];

        if (messageBox) {
            messageBox.focus();
            const event = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: message
            });

            messageBox.textContent = message;
            messageBox.dispatchEvent(event);

            let sendMsg = setInterval(function () {
                let sendButton = document.querySelector("span[data-icon='send']");
                if (sendButton) {
                    sendButton.click();
                    clearInterval(sendMsg);
                }
            }, 200);
        }
    }

    // Function to handle body clicks
    function handleBodyClick() {
        let attachMenuButton = document.querySelector('span[data-icon="plus"]');
        if (attachMenuButton) {
            insertQuickReplyButtons();
        }
    }

    window.onclick = () => {
        handleBodyClick();
    }

    document.body.addEventListener('click', handleBodyClick, false);

})();
