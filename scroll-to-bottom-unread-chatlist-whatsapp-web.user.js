// ==UserScript==
// @name         Scroll to Bottom on Unread - WhatsApp Web
// @namespace    https://laksa19.github.io/WhatsApp-Web-Quick-Reply/
// @downloadURL  https://github.com/laksa19/WhatsApp-Web-Quick-Reply/raw/refs/heads/main/scroll-to-bottom-unread-chatlist-whatsapp-web.user.js
// @updateURL    https://github.com/laksa19/WhatsApp-Web-Quick-Reply/raw/refs/heads/main/scroll-to-bottom-unread-chatlist-whatsapp-web.user.js
// @version      1.0
// @description  Scroll to bottom of pane-side on WhatsApp Web when Unread is clicked
// @author       Laksamadi Guko
// @match        https://web.whatsapp.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let scrollInterval; // Menyimpan interval untuk scrolling

    // Fungsi untuk scroll ke bawah
    function scrollToBottom() {
        const paneSide = document.getElementById("pane-side");
        if (paneSide) {
            paneSide.scrollTop = paneSide.scrollHeight;
        }
    }

    // Fungsi untuk memulai scroll otomatis menggunakan setInterval
    function startScroll() {
        scrollInterval = setInterval(scrollToBottom, 1000); // Scroll setiap 1 detik
    }

    // Fungsi untuk menghentikan scroll otomatis
    function stopScroll() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }

    // Event listener untuk tombol "Unread", "All", dan "Group"
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.textContent.includes("Unread")) {
            startScroll(); // Mulai scrolling otomatis jika "Unread" diklik
        } else if (e.target && (e.target.textContent.includes("All") || e.target.textContent.includes("Group"))) {
            stopScroll(); // Hentikan scrolling otomatis jika "All" atau "Group" diklik
        }
    });
})();