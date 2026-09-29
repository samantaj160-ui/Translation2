// ==========================================
// LINGUATRANSLATE - COMPLETE SCRIPT
// ==========================================


// ==========================================
// LANGUAGE NAMES
// ==========================================

const languageNames = {
    auto: "Auto Detect",

    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    pa: "Punjabi",
    ur: "Urdu",

    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",

    ja: "Japanese",
    ko: "Korean",
    "zh-CN": "Chinese",
    ar: "Arabic"
};


// ==========================================
// HTML ELEMENTS
// ==========================================

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");

const translateButton =
    document.getElementById("translateButton");

const swapButton =
    document.getElementById("swapButton");

const micButton =
    document.getElementById("micButton");

const speakerButton =
    document.getElementById("speakerButton");

const copyButton =
    document.getElementById("copyButton");

const clearInput =
    document.getElementById("clearInput");

const charCount =
    document.getElementById("charCount");

const detectedLanguage =
    document.getElementById("detectedLanguage");

const translationStatus =
    document.getElementById("translationStatus");

const translationInfo =
    document.getElementById("translationInfo");

const historyList =
    document.getElementById("historyList");

const clearHistory =
    document.getElementById("clearHistory");

const errorBox =
    document.getElementById("errorBox");

const messageIcon =
    document.getElementById("messageIcon");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");

const closeMessage =
    document.getElementById("closeMessage");


// ==========================================
// MESSAGE / ERROR SYSTEM
// ==========================================

function showMessage(title, message, type = "error") {

    if (!errorBox) return;

    errorBox.classList.remove("hidden");

    messageTitle.textContent = title;
    messageText.textContent = message;


    if (type === "success") {

        messageIcon.textContent = "✓";

        errorBox.style.background = "#ecfdf5";
        errorBox.style.borderColor = "#a7f3d0";
        errorBox.style.color = "#047857";

    }

    else if (type === "info") {

        messageIcon.textContent = "ℹ️";

        errorBox.style.background = "#eff6ff";
        errorBox.style.borderColor = "#bfdbfe";
        errorBox.style.color = "#1d4ed8";

    }

    else {

        messageIcon.textContent = "⚠️";

        errorBox.style.background = "#fff7ed";
        errorBox
