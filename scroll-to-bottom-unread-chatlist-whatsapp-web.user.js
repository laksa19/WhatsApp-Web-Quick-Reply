// ==UserScript==
// @name         Scroll to Bottom on Unread Click - WhatsApp Web
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Scroll to bottom of pane-side on WhatsApp Web when Unread is clicked
// @author       Your Name
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let scrollInterval = null; // Menyimpan interval untuk scrolling

    // Fungsi untuk scroll ke bawah
    function scrollToBottom() {
        const paneSide = document.getElementById("pane-side");
        if (paneSide) {
            paneSide.scrollTop = paneSide.scrollHeight;
        }
    }

    // Fungsi untuk memulai scroll otomatis menggunakan setInterval
    function startScroll() {
        if (!scrollInterval) { // Jika scrollInterval belum berjalan
            scrollInterval = setInterval(scrollToBottom, 500); // Scroll setiap 1 detik
        }
    }

    // Fungsi untuk menghentikan scroll otomatis
    function stopScroll() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }

    // Event listener untuk tombol "Unread"
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.textContent === "Unread") {
            // Cek jika elemen induk dari Unread adalah <button> dengan aria-pressed="false"
            const parentButton = e.target.closest('button');
            if (parentButton && parentButton.getAttribute('aria-pressed') === "false") {
                startScroll(); // Mulai scrolling otomatis jika Unread diklik dan aria-pressed="true"
            } else {
                stopScroll(); // Hentikan scroll jika aria-pressed="false"
            }
        } else {
            stopScroll(); // Hentikan scrolling otomatis jika "All" diklik
        }
    });
})();
