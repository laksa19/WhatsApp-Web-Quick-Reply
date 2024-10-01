// ==UserScript==
// @name         WhatsApp Web Quick Reply V2
// @namespace    https://laksa19.github.io/WhatsApp-Web-Quick-Reply/
// @downloadURL  https://github.com/laksa19/WhatsApp-Web-Quick-Reply/raw/refs/heads/main/whatsapp_web_quick_reply.user.js
// @updateURL    https://github.com/laksa19/WhatsApp-Web-Quick-Reply/raw/refs/heads/main/whatsapp_web_quick_reply.user.js
// @version      0.3
// @description  WhatsApp Web Quick Reply V2
// @author       Laksamadi Guko
// @icon         https://laksa19.github.io/WhatsApp-Web-Quick-Reply/favicon.png
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // JSON configuration for buttons and messages
    let quickReplyConfig = JSON.parse(localStorage.getItem('quickReplyConfig')) || [
        { text: 'halo', message: 'Halo 👋' },
        { text: 'thanks', message: 'Terima kasih.' }
    ];

    // Create modal HTML and inject into the DOM
    function createCrudModal() {
        const modalHTML = `
        <div id="crudModal" style="display:none; position:fixed; z-index:10000; left:0; top:0; width:100%; height:100%; background-color: rgba(0, 0, 0, 0.5);">
            <div style="background-color: var(--rich-text-panel-background); margin: 5% auto; padding: 20px; border-radius: 10px; width: 50%;">
                <span id="closeModal" style="float: right; font-size: 1.5rem; cursor: pointer;">&times;</span>
                <h2>Quick Reply Config</h2><br>
                <form id="configForm">
                    <label for="text">Text:</label>
                    <input style="color: var(--primary); background-color: var(--compose-input-border); margin-top:5px; width:100%; padding:9px 12px; outline:none; border-radius:10px; box-sizing: border-box; border:none;" type="text" id="text" required>
                    <br><br>
                    <label for="message">Message:</label>
                    <textarea style="color: var(--primary); background-color: var(--compose-input-border); margin-top:5px; width:100%; height:100px; resize:none; padding:9px 12px; outline:none; border-radius:10px; box-sizing: border-box;  border:none;" id="message" required></textarea>
                    <br><br>
                    <div style="display:flex; justify-content: space-between;">
                    <div>
                    <button style="padding: 10px; font-size: 0.875rem; font-weight: 500; line-height: 1.1429; background-color: var(--button-primary-background); color: var(--button-primary); border: none; border-radius: 24px; cursor: pointer; text-align: center; min-width: 35px;" type="submit">Add/Update</button>
                    </div>
                    <div>
                    <button type="button" id="exportConfig" style="margin-right: 10px; padding: 10px; font-size: 0.875rem; font-weight: 500; line-height: 1.1429; background-color: var(--button-primary-background); color: var(--button-primary); border: none; border-radius: 24px; cursor: pointer;">Export Config</button>
                    <button type="button" id="importConfig" style="padding: 10px; font-size: 0.875rem; font-weight: 500; line-height: 1.1429; background-color: var(--button-primary-background); color: var(--button-primary); border: none; border-radius: 24px; cursor: pointer;">Import Config</button>
                    </div>
                    </div>
                </form>
                <br>
                <input type="file" id="importFileInput" style="display:none;">

                <div id="tableQRContainer" style="overflow-y:auto;">
                <table id="quickReplyTable" style="width:100%; border-collapse:collapse; color:var(--primary);">
                    <thead>
                        <tr>
                            <th style="border: 1px solid var(--border-stronger); padding:8px;">Text</th>
                            <th style="border: 1px solid var(--border-stronger); padding:8px;">Message</th>
                            <th style="border: 1px solid var(--border-stronger); padding:8px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML); // Inject modal into body

        // Close modal function
        document.getElementById('closeModal').addEventListener('click', function () {
            document.getElementById('crudModal').style.display = 'none';
        });

        // Form submission for Add/Update
        document.getElementById('configForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const text = document.getElementById('text').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!text || !message) {
                alert("Text dan Message tidak boleh kosong!");
                return;
            }

            const existingIndex = quickReplyConfig.findIndex(item => item.text === text);
            if (existingIndex >= 0) {
                quickReplyConfig[existingIndex].message = message; // Update message if exist
            } else {
                quickReplyConfig.push({ text, message }); // Add new quick reply
            }


            localStorage.setItem('quickReplyConfig', JSON.stringify(quickReplyConfig));

            // Render table after update
            renderTable();

            // Reset form after submit
            document.getElementById('configForm').reset();

        });

        // Export configuration
        document.getElementById('exportConfig').addEventListener('click', function () {
            const blob = new Blob([JSON.stringify(quickReplyConfig, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quickReplyConfig.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        // Import configuration
        document.getElementById('importConfig').addEventListener('click', function () {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const importedConfig = JSON.parse(e.target.result);
                    if (Array.isArray(importedConfig)) {
                        quickReplyConfig = importedConfig;
                        localStorage.setItem('quickReplyConfig', JSON.stringify(quickReplyConfig));
                        renderTable();
                        alert('Config successfully imported!');
                    } else {
                        alert('Invalid configuration format.');
                    }
                } catch (error) {
                    alert('Error parsing JSON file.');
                }
            };
            reader.readAsText(file);
        });

        // Render table from config
        renderTable();
    }

    // Function to render the table with current config
    function renderTable() {
        let tableContainer = document.getElementById('tableQRContainer');
        tableContainer.style.maxHeight = 'unset';
        tableContainer.style.maxHeight = '300px';
        const tbody = document.getElementById('quickReplyTable').querySelector('tbody');
        tbody.innerHTML = ''; // Clear previous table data
        quickReplyConfig.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="border: 1px solid var(--border-stronger); padding:8px;">${item.text}</td>
                <td style="border: 1px solid var(--border-stronger); padding:8px;">${item.message}</td>
                <td style="border: 1px solid var(--border-stronger); padding:8px;">
                    <div class="editBtn" style="cursor:pointer; margin:5px 5px; 7px 5px" data-index="${index}">Edit</div>
                    <div class="deleteBtn"  style="cursor:pointer; margin:5px 5px; 7px 5px" data-index="${index}">Delete</div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.editBtn').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                const config = quickReplyConfig[index];
                document.getElementById('text').value = config.text;
                document.getElementById('message').value = config.message;
                document.getElementById('crudModal').style.display = 'block';
            });
        });

        document.querySelectorAll('.deleteBtn').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                quickReplyConfig.splice(index, 1); // Remove from config array
                localStorage.setItem('quickReplyConfig', JSON.stringify(quickReplyConfig)); // Save changes
                renderTable(); // Re-render table
            });
        });
    }

    // Function to open the modal for CRUD operations
    function openCrudModal() {
        document.getElementById('crudModal').style.display = 'block';
    }

    // Function to create and insert quick reply buttons
    function insertQuickReplyButtons() {

        // Check if the buttons already exist to avoid duplication
        if (document.getElementById('quickReplyButtonsContainer')) return;

        createCrudModal(); // Inject modal on page load

        // Create a container for the buttons
        let container = document.createElement('div');
        container.id = 'quickReplyButtonsContainer';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '5px';
        container.style.padding = '10px 0 5px 0';
        container.style.justifyContent = 'center';
        container.style.backgroundColor = 'var(--rich-text-panel-background)';
        container.style.borderLeft = '1px solid var(--border-stronger)';

        let settingBtnContainer = document.querySelectorAll('footer span div')[0];

        let settingBtn = document.createElement('div');
        settingBtn.id = 'openCrudModalBtn';
        settingBtn.title = 'Quick reply setting';
        settingBtn.innerHTML = '<span aria-hidden="true"><svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>Quick reply setting</title><path d="M11.75 14.5C13.1307 14.5 14.25 13.3807 14.25 12C14.25 10.6193 13.1307 9.5 11.75 9.5C10.3693 9.5 9.25 10.6193 9.25 12C9.25 13.3807 10.3693 14.5 11.75 14.5Z" stroke="currentColor" stroke-width="2"></path><mask id="mask0_226_11" maskUnits="userSpaceOnUse" x="2" y="2" width="20" height="20" style="mask-type: luminance;"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.87042 22H13.6204C13.8704 22 14.0871 21.9167 14.2704 21.75C14.4538 21.5833 14.5621 21.375 14.5954 21.125L14.8954 18.8C15.0954 18.7167 15.2954 18.6167 15.4954 18.5C15.6954 18.3833 15.8871 18.2583 16.0704 18.125L18.1954 19.025C18.4288 19.1083 18.6663 19.1125 18.9079 19.0375C19.1496 18.9625 19.3371 18.8167 19.4704 18.6L21.3204 15.4C21.4538 15.1833 21.4954 14.95 21.4454 14.7C21.3954 14.45 21.2704 14.25 21.0704 14.1L19.1954 12.675C19.2288 12.5583 19.2454 12.4458 19.2454 12.3375V11.6625C19.2454 11.5542 19.2371 11.4417 19.2204 11.325L21.0954 9.9C21.2954 9.75 21.4204 9.55 21.4704 9.3C21.5204 9.05 21.4788 8.81667 21.3454 8.6L19.4954 5.375C19.3621 5.15833 19.1788 5.01667 18.9454 4.95C18.7121 4.88333 18.4788 4.89167 18.2454 4.975L16.0704 5.875C15.8871 5.74167 15.6996 5.61667 15.5079 5.5C15.3163 5.38333 15.1121 5.28333 14.8954 5.2L14.5954 2.875C14.5621 2.625 14.4538 2.41667 14.2704 2.25C14.0871 2.08333 13.8704 2 13.6204 2H9.87042C9.62046 2 9.40379 2.08333 9.22046 2.25C9.03712 2.41667 8.92879 2.625 8.89546 2.875L8.59546 5.2C8.39546 5.28333 8.19546 5.38333 7.99546 5.5C7.79546 5.61667 7.60379 5.74167 7.42046 5.875L5.24546 4.975C5.01212 4.89167 4.77462 4.87917 4.53296 4.9375C4.29129 4.99583 4.11212 5.14167 3.99546 5.375L2.14546 8.6C2.01212 8.81667 1.97046 9.05 2.02046 9.3C2.07046 9.55 2.19546 9.75 2.39546 9.9L4.27046 11.325C4.25379 11.4417 4.24546 11.5542 4.24546 11.6625V12.3375C4.24546 12.4458 4.25379 12.5583 4.27046 12.675L2.39546 14.1C2.19546 14.25 2.07046 14.45 2.02046 14.7C1.97046 14.95 2.01212 15.1833 2.14546 15.4L3.99546 18.625C4.12879 18.8417 4.31212 18.9833 4.54546 19.05C4.77879 19.1167 5.01212 19.1083 5.24546 19.025L7.42046 18.125C7.60379 18.2583 7.79129 18.3833 7.98296 18.5C8.17462 18.6167 8.37879 18.7167 8.59546 18.8L8.89546 21.125C8.92879 21.375 9.03712 21.5833 9.22046 21.75C9.40379 21.9167 9.62046 22 9.87042 22Z" fill="white"></path></mask><g mask="url(#mask0_226_11)"><path d="M14.5954 21.125L16.5779 21.3893L16.579 21.3809L14.5954 21.125ZM14.8954 18.8L14.1262 16.9538L13.0597 17.3982L12.9119 18.5441L14.8954 18.8ZM16.0704 18.125L16.8504 16.2834L15.8089 15.8422L14.8941 16.5075L16.0704 18.125ZM18.1954 19.025L17.4155 20.8666L17.4685 20.8891L17.5228 20.9085L18.1954 19.025ZM19.4704 18.6L21.1738 19.6482L21.1882 19.6248L21.2019 19.601L19.4704 18.6ZM21.3204 15.4L19.6171 14.3518L19.6027 14.3752L19.589 14.399L21.3204 15.4ZM21.0704 14.1L19.8602 15.6924L19.8704 15.7L21.0704 14.1ZM19.1954 12.675L17.2724 12.1256L16.8968 13.4401L17.9853 14.2673L19.1954 12.675ZM19.2204 11.325L18.0103 9.73268L17.0743 10.444L17.2405 11.6078L19.2204 11.325ZM21.0954 9.9L19.8954 8.29997L19.8853 8.30768L21.0954 9.9ZM21.3454 8.6L19.6106 9.59517L19.626 9.62193L19.6421 9.64819L21.3454 8.6ZM19.4954 5.375L21.2303 4.37983L21.2149 4.35307L21.1988 4.32681L19.4954 5.375ZM18.2454 4.975L17.5728 3.09152L17.5263 3.10811L17.4807 3.12697L18.2454 4.975ZM16.0704 5.875L14.8941 7.49247L15.8 8.15135L16.8351 7.72303L16.0704 5.875ZM14.8954 5.2L12.9119 5.45594L13.0645 6.63862L14.1775 7.06669L14.8954 5.2ZM14.5954 2.875L16.579 2.61905L16.5779 2.61067L14.5954 2.875ZM8.89544 2.875L6.91296 2.61067L6.91188 2.61906L8.89544 2.875ZM8.59544 5.2L9.36467 7.04615L10.4311 6.60179L10.579 5.45594L8.59544 5.2ZM7.42044 5.875L6.65573 7.72303L7.69083 8.15135L8.59678 7.49247L7.42044 5.875ZM5.24544 4.975L6.01014 3.12697L5.96456 3.10811L5.91811 3.09152L5.24544 4.975ZM3.99544 5.375L5.73027 6.37017L5.75872 6.32057L5.78429 6.26943L3.99544 5.375ZM2.14544 8.6L3.84875 9.64819L3.86492 9.62193L3.88027 9.59517L2.14544 8.6ZM2.39544 9.9L3.60563 8.30764L3.59544 8.3L2.39544 9.9ZM4.27044 11.325L6.25034 11.6078L6.4166 10.444L5.4806 9.73268L4.27044 11.325ZM4.27044 12.675L5.4806 14.2673L6.4166 13.556L6.25034 12.3922L4.27044 12.675ZM2.39544 14.1L3.59546 15.7L3.6056 15.6923L2.39544 14.1ZM2.14544 15.4L3.88027 14.4048L3.86492 14.3781L3.84875 14.3518L2.14544 15.4ZM3.99544 18.625L2.26061 19.6202L2.27596 19.6469L2.29212 19.6732L3.99544 18.625ZM5.24544 19.025L5.91811 20.9085L5.96456 20.8919L6.01014 20.873L5.24544 19.025ZM7.42044 18.125L8.59678 16.5075L7.69083 15.8487L6.65573 16.277L7.42044 18.125ZM8.59544 18.8L10.579 18.5441L10.4264 17.3614L9.3134 16.9333L8.59544 18.8ZM8.89544 21.125L6.91186 21.3809L6.91298 21.3893L8.89544 21.125ZM13.6204 20H9.8704V24H13.6204V20ZM12.9251 20.2701C13.0043 20.1981 13.1143 20.1239 13.2525 20.0708C13.3903 20.0178 13.519 20 13.6204 20V24C14.363 24 15.0606 23.7345 15.6158 23.2299L12.9251 20.2701ZM12.613 20.8607C12.6247 20.7729 12.6543 20.6624 12.7148 20.546C12.7755 20.4292 12.8517 20.3369 12.9251 20.2701L15.6158 23.2299C16.155 22.7397 16.4834 22.0978 16.5779 21.3893L12.613 20.8607ZM12.9119 18.5441L12.6119 20.8691L16.579 21.3809L16.879 19.0559L12.9119 18.5441ZM14.4877 16.7724C14.3593 16.8474 14.2388 16.9069 14.1262 16.9538L15.6647 20.6462C15.9521 20.5264 16.2316 20.386 16.5032 20.2276L14.4877 16.7724ZM14.8941 16.5075C14.7662 16.6005 14.6309 16.6889 14.4877 16.7724L16.5032 20.2276C16.76 20.0778 17.008 19.9161 17.2468 19.7425L14.8941 16.5075ZM18.9754 17.1834L16.8504 16.2834L15.2905 19.9666L17.4155 20.8666L18.9754 17.1834ZM18.3151 17.1274C18.3842 17.1059 18.4762 17.089 18.5836 17.0909C18.6916 17.0928 18.7889 17.1132 18.8681 17.1415L17.5228 20.9085C18.1732 21.1408 18.855 21.148 19.5007 20.9476L18.3151 17.1274ZM17.7671 17.5518C17.8169 17.4708 17.8937 17.3774 18.0019 17.2932C18.1103 17.2089 18.2212 17.1565 18.3151 17.1274L19.5007 20.9476C20.2074 20.7283 20.7883 20.2746 21.1738 19.6482L17.7671 17.5518ZM19.589 14.399L17.739 17.599L21.2019 19.601L23.0519 16.401L19.589 14.399ZM19.4843 15.0922C19.464 14.9906 19.4565 14.8586 19.4828 14.7109C19.5092 14.5632 19.5621 14.4412 19.6171 14.3518L23.0238 16.4482C23.4225 15.8002 23.5555 15.0521 23.4066 14.3078L19.4843 15.0922ZM19.8704 15.7C19.7852 15.6361 19.694 15.5438 19.6182 15.4225C19.5427 15.3017 19.5028 15.1847 19.4843 15.0922L23.4066 14.3078C23.2622 13.5858 22.8726 12.9516 22.2704 12.5L19.8704 15.7ZM17.9853 14.2673L19.8602 15.6924L22.2806 12.5077L20.4056 11.0827L17.9853 14.2673ZM17.2454 12.3375C17.2454 12.2393 17.2607 12.1665 17.2724 12.1256L21.1185 13.2244C21.1968 12.9502 21.2454 12.6524 21.2454 12.3375H17.2454ZM17.2454 11.6625V12.3375H21.2454V11.6625H17.2454ZM17.2405 11.6078C17.245 11.6389 17.2454 11.6566 17.2454 11.6625H21.2454C21.2454 11.4517 21.2292 11.2444 21.2003 11.0422L17.2405 11.6078ZM19.8853 8.30768L18.0103 9.73268L20.4306 12.9173L22.3056 11.4923L19.8853 8.30768ZM19.5093 8.90777C19.5278 8.81526 19.5677 8.69828 19.6432 8.5775C19.719 8.45616 19.8102 8.3639 19.8954 8.29997L22.2954 11.5C22.8976 11.0484 23.2872 10.4142 23.4316 9.69223L19.5093 8.90777ZM19.6421 9.64819C19.5871 9.5588 19.5342 9.43682 19.5078 9.28908C19.4815 9.14142 19.489 9.00936 19.5093 8.90777L23.4316 9.69223C23.5805 8.94794 23.4475 8.19983 23.0488 7.55181L19.6421 9.64819ZM17.7606 6.37017L19.6106 9.59517L23.0803 7.60483L21.2303 4.37983L17.7606 6.37017ZM18.396 6.87305C18.2804 6.84001 18.1537 6.78048 18.035 6.68882C17.9177 6.59818 17.8396 6.50037 17.7921 6.42319L21.1988 4.32681C20.8175 3.70724 20.2335 3.238 19.4949 3.02695L18.396 6.87305ZM18.9181 6.85848C18.8533 6.88163 18.7675 6.90138 18.6668 6.90498C18.5657 6.90859 18.473 6.89505 18.396 6.87305L19.4949 3.02695C18.8511 2.84301 18.1905 2.8709 17.5728 3.09152L18.9181 6.85848ZM16.8351 7.72303L19.0101 6.82303L17.4807 3.12697L15.3057 4.02697L16.8351 7.72303ZM14.468 7.2084C14.6125 7.29634 14.7545 7.39097 14.8941 7.49247L17.2468 4.25753C17.0197 4.09236 16.7867 3.93699 16.5478 3.7916L14.468 7.2084ZM14.1775 7.06669C14.2862 7.10849 14.3822 7.15615 14.468 7.2084L16.5478 3.7916C16.2503 3.61052 15.938 3.45817 15.6134 3.33331L14.1775 7.06669ZM12.6119 3.13094L12.9119 5.45594L16.879 4.94406L16.579 2.61905L12.6119 3.13094ZM12.9251 3.72988C12.8517 3.66314 12.7755 3.57076 12.7148 3.45395C12.6543 3.33761 12.6247 3.22709 12.613 3.13933L16.5779 2.61067C16.4834 1.90221 16.155 1.26032 15.6158 0.77012L12.9251 3.72988ZM13.6204 4C13.519 4 13.3903 3.98222 13.2525 3.92919C13.1143 3.87605 13.0043 3.80191 12.9251 3.72988L15.6158 0.77012C15.0606 0.265451 14.363 0 13.6204 0V4ZM9.8704 4H13.6204V0H9.8704V4ZM10.5658 3.72988C10.4865 3.80191 10.3766 3.87605 10.2384 3.92919C10.1005 3.98222 9.9719 4 9.8704 4V0C9.12787 0 8.43023 0.265451 7.87509 0.77012L10.5658 3.72988ZM10.8779 3.13933C10.8662 3.22709 10.8366 3.33762 10.7761 3.45396C10.7154 3.57076 10.6392 3.66314 10.5658 3.72988L7.87509 0.77012C7.33588 1.26032 7.00742 1.9022 6.91296 2.61067L10.8779 3.13933ZM10.579 5.45594L10.879 3.13094L6.91188 2.61906L6.61188 4.94406L10.579 5.45594ZM9.00318 7.22756C9.1316 7.15265 9.25209 7.09306 9.36467 7.04615L7.82621 3.35385C7.53878 3.47361 7.25928 3.61402 6.9877 3.77244L9.00318 7.22756ZM8.59678 7.49247C8.72465 7.39947 8.85996 7.3111 9.00318 7.22756L6.9877 3.77244C6.73092 3.92223 6.48289 4.08386 6.24409 4.25753L8.59678 7.49247ZM4.48073 6.82303L6.65573 7.72303L8.18514 4.02697L6.01014 3.12697L4.48073 6.82303ZM5.00222 6.88166C4.94371 6.89579 4.87006 6.90472 4.78719 6.90036C4.70427 6.896 4.63109 6.87931 4.57277 6.85848L5.91811 3.09152C5.31682 2.87677 4.6824 2.84398 4.06366 2.99334L5.00222 6.88166ZM5.78429 6.26943C5.73217 6.37367 5.6371 6.51376 5.47986 6.64175C5.32037 6.77156 5.14931 6.84616 5.00222 6.88166L4.06366 2.99334C3.21731 3.19763 2.572 3.74974 2.20658 4.48057L5.78429 6.26943ZM3.88027 9.59517L5.73027 6.37017L2.26061 4.37983L0.410609 7.60483L3.88027 9.59517ZM3.9816 8.90777C4.00192 9.00936 4.00941 9.14142 3.98304 9.28908C3.95666 9.43682 3.90377 9.5588 3.84875 9.64819L0.442121 7.55181C0.0433362 8.19983 -0.0895818 8.94794 0.0592762 9.69223L3.9816 8.90777ZM3.59544 8.3C3.68068 8.36393 3.77185 8.45616 3.84768 8.5775C3.92317 8.69828 3.9631 8.81525 3.9816 8.90777L0.0592762 9.69223C0.203672 10.4142 0.593266 11.0484 1.19544 11.5L3.59544 8.3ZM5.4806 9.73268L3.60563 8.30764L1.18527 11.4923L3.06027 12.9173L5.4806 9.73268ZM6.24544 11.6625C6.24544 11.6566 6.2459 11.6389 6.25034 11.6078L2.29054 11.0422C2.26164 11.2444 2.24544 11.4517 2.24544 11.6625H6.24544ZM6.24544 12.3375V11.6625H2.24544V12.3375H6.24544ZM6.25034 12.3922C6.2459 12.3611 6.24544 12.3434 6.24544 12.3375H2.24544C2.24544 12.5483 2.26164 12.7556 2.29054 12.9578L6.25034 12.3922ZM3.6056 15.6923L5.4806 14.2673L3.06027 11.0827L1.18527 12.5077L3.6056 15.6923ZM3.9816 15.0922C3.9631 15.1847 3.92317 15.3017 3.84768 15.4225C3.77185 15.5438 3.6807 15.6361 3.59546 15.7L1.19544 12.5C0.593266 12.9516 0.203672 13.5858 0.0592762 14.3078L3.9816 15.0922ZM3.84875 14.3518C3.90377 14.4412 3.95666 14.5632 3.98304 14.7109C4.00941 14.8586 4.00192 14.9906 3.9816 15.0922L0.0592762 14.3078C-0.0895818 15.0521 0.0433353 15.8002 0.442122 16.4482L3.84875 14.3518ZM5.73027 17.6298L3.88027 14.4048L0.410609 16.3952L2.26061 19.6202L5.73027 17.6298ZM5.09489 17.127C5.21053 17.16 5.33721 17.2195 5.45583 17.3112C5.57313 17.4018 5.65126 17.4996 5.69876 17.5768L2.29212 19.6732C2.6734 20.2928 3.25734 20.762 3.99599 20.973L5.09489 17.127ZM4.57276 17.1415C4.63756 17.1184 4.72334 17.0986 4.82405 17.095C4.92518 17.0914 5.01786 17.1049 5.09489 17.127L3.99599 20.973C4.63979 21.157 5.30038 21.1291 5.91811 20.9085L4.57276 17.1415ZM6.65573 16.277L4.48073 17.177L6.01014 20.873L8.18514 19.973L6.65573 16.277ZM9.02283 16.7916C8.87835 16.7037 8.73635 16.609 8.59678 16.5075L6.24409 19.7425C6.47119 19.9076 6.70419 20.063 6.94304 20.2084L9.02283 16.7916ZM9.3134 16.9333C9.20471 16.8915 9.10868 16.8439 9.02283 16.7916L6.94304 20.2084C7.24053 20.3895 7.55283 20.5418 7.87747 20.6667L9.3134 16.9333ZM10.879 20.8691L10.579 18.5441L6.61188 19.0559L6.91186 21.3809L10.879 20.8691ZM10.5658 20.2701C10.6392 20.3369 10.7154 20.4292 10.7761 20.546C10.8366 20.6624 10.8662 20.7729 10.8779 20.8607L6.91298 21.3893C7.00744 22.0978 7.33587 22.7397 7.87509 23.2299L10.5658 20.2701ZM9.8704 20C9.9719 20 10.1005 20.0178 10.2384 20.0708C10.3766 20.1239 10.4865 20.1981 10.5658 20.2701L7.87509 23.2299C8.43023 23.7345 9.12787 24 9.8704 24V20Z" fill="currentColor"></path></g></svg></span>';
        settingBtn.style.margin = '13px 8px';
        settingBtn.style.verticalAlign = 'center';
        settingBtn.style.textAlign = 'center';
        settingBtn.style.maxHeight = '26px';
        settingBtn.style.cursor = 'pointer';
        settingBtn.style.color = 'var(--icon)';

        // Add event listener to open modal on click
        settingBtn.addEventListener('click', openCrudModal);

        settingBtnContainer.prepend(settingBtn); // Prepend settingBtn to the footer

        // Create and append each button based on the JSON configuration
        quickReplyConfig.forEach(config => {

            let button = document.createElement('div');
            button.title = config.message;
            button.innerText = config.text;
            button.style.padding = '10px';
            button.style.fontSize = '.875rem';
            button.style.fontWeight = '500';
            button.style.lineHeight = '1.1429';
            button.style.backgroundColor = 'var(--button-primary-background)';
            button.style.color = 'var(--button-primary)';
            button.style.border = 'none';
            button.style.borderRadius = '24px';
            button.style.cursor = 'pointer';
            button.style.verticalAlign = 'center';
            button.style.textAlign = 'center';
            button.style.minWidth = '35px';

            // Append the button to the container
            container.appendChild(button);

            button.addEventListener('click', function () {
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
