
// ===============================
// LANGUAGE TRANSLATION TOOL
// ===============================

// ---------- DOM ELEMENTS ----------

const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");

const swapButton = document.getElementById("swapButton");

const errorBox = document.getElementById("errorBox");
const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const closeMessage = document.getElementById("closeMessage");

const detectedLanguage = document.getElementById("detectedLanguage");

const inputText = document.getElementById("inputText");
const charCount = document.getElementById("charCount");
const micButton = document.getElementById("micButton");
const clearInput = document.getElementById("clearInput");

const outputText = document.getElementById("outputText");
const translationStatus = document.getElementById("translationStatus");
const translationInfo = document.getElementById("translationInfo");

const copyButton = document.getElementById("copyButton");
const speakerButton = document.getElementById("speakerButton");

const translateButton = document.getElementById("translateButton");

const clearHistory = document.getElementById("clearHistory");
const historyList = document.getElementById("historyList");


// ---------- LANGUAGE NAMES ----------

const languageNames = {
    auto: "Auto Detect",
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    "zh-CN": "Chinese",
    pt: "Portuguese",
    ru: "Russian",
    ar: "Arabic",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    pa: "Punjabi",
    ur: "Urdu"
};


// ---------- ERROR SYSTEM ----------

function showMessage(title, message, type = "error") {

    if (!errorBox) return;

    messageTitle.textContent = title;
    messageText.textContent = message;

    if (type === "success") {
        messageIcon.textContent = "✓";
    } else if (type === "warning") {
        messageIcon.textContent = "⚠";
    } else {
        messageIcon.textContent = "✕";
    }

    errorBox.classList.remove("hidden");
}


function hideMessage() {

    if (errorBox) {
        errorBox.classList.add("hidden");
    }
}


if (closeMessage) {
    closeMessage.addEventListener("click", hideMessage);
}


// ---------- CHARACTER COUNT ----------

function updateCharacterCount() {

    if (!inputText || !charCount) return;

    const count = inputText.value.length;

    charCount.textContent = `${count} characters`;
}


if (inputText) {
    inputText.addEventListener("input", updateCharacterCount);
}


// ---------- HTML ENTITY DECODER ----------

function decodeHtmlEntities(text) {

    const textarea = document.createElement("textarea");

    textarea.innerHTML = text;

    return textarea.value;
}


// ---------- TRANSLATION ----------

async function translateText() {

    const text = inputText.value.trim();

    let source = sourceLang.value;
    const target = targetLang.value;

    hideMessage();

    if (!text) {

        showMessage(
            "Enter some text",
            "Please enter text that you want to translate.",
            "warning"
        );

        return;
    }

    if (!target) {

        showMessage(
            "Select a language",
            "Please select a target language.",
            "warning"
        );

        return;
    }


    if (source === target && source !== "auto") {

        outputText.value = text;

        translationStatus.textContent = "Completed";

        translationInfo.textContent =
            `${languageNames[source] || source} → ${languageNames[target] || target}`;

        saveHistory(
            text,
            text,
            source,
            target
        );

        return;
    }


    translationStatus.textContent = "Translating...";
    translationInfo.textContent = "Please wait...";

    translateButton.disabled = true;


    try {

        // ==========================================
        // AUTO LANGUAGE DETECTION
        // ==========================================

        if (source === "auto") {

            source = await detectLanguage(text);

            if (source === target) {

                outputText.value = text;

                translationStatus.textContent = "Completed";

                translationInfo.textContent =
                    `${languageNames[source] || source} → ${languageNames[target] || target}`;

                saveHistory(
                    text,
                    text,
                    source,
                    target
                );

                translateButton.disabled = false;

                return;
            }
        }


        // ==========================================
        // GOOGLE TRANSLATE REQUEST
        // ==========================================

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx" +
            "&sl=" + encodeURIComponent(source) +
            "&tl=" + encodeURIComponent(target) +
            "&dt=t" +
            "&q=" + encodeURIComponent(text);


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Translation service returned ${response.status}`
            );
        }


        const data = await response.json();


        if (!Array.isArray(data) || !Array.isArray(data[0])) {

            throw new Error(
                "Invalid translation response."
            );
        }


        const translation = data[0]
            .map(item => item[0])
            .filter(Boolean)
            .join("");


        if (!translation) {

            throw new Error(
                "Empty translation received."
            );
        }


        // ==========================================
        // DISPLAY RESULT
        // ==========================================

        outputText.value = decodeHtmlEntities(
            translation
        );

        translationStatus.textContent = "Completed";

        translationInfo.textContent =
            `${languageNames[source] || source} → ${languageNames[target] || target}`;


        // ==========================================
        // SAVE HISTORY
        // ==========================================

        saveHistory(
            text,
            translation,
