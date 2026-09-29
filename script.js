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
// GET HTML ELEMENTS
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
// ERROR / MESSAGE SYSTEM
// ==========================================

function showMessage(title, message, type = "error") {

    errorBox.classList.remove("hidden");

    messageTitle.textContent = title;
    messageText.textContent = message;

    if (type === "success") {

        messageIcon.textContent = "✓";

        errorBox.style.background = "#ecfdf5";
        errorBox.style.borderColor = "#a7f3d0";
        errorBox.style.color = "#047857";

    } else if (type === "info") {

        messageIcon.textContent = "ℹ️";

        errorBox.style.background = "#eff6ff";
        errorBox.style.borderColor = "#bfdbfe";
        errorBox.style.color = "#1d4ed8";

    } else {

        messageIcon.textContent = "⚠️";

        errorBox.style.background = "#fff7ed";
        errorBox.style.borderColor = "#fed7aa";
        errorBox.style.color = "#9a3412";
    }
}


function hideMessage() {

    errorBox.classList.add("hidden");
}


if (closeMessage) {
    closeMessage.addEventListener("click", hideMessage);
}


// ==========================================
// CHARACTER COUNTER
// ==========================================

if (inputText) {

    inputText.addEventListener("input", function () {

        const length = inputText.value.length;

        charCount.textContent =
            `${length} / 5000`;

        hideMessage();
    });
}


// ==========================================
// TRANSLATION
// ==========================================

async function translateText() {

    const text = inputText.value.trim();

    const source = sourceLang.value;
    const target = targetLang.value;


    // Empty text

    if (!text) {

        showMessage(
            "Text required",
            "Please enter some text before translating."
        );

        inputText.focus();

        return;
    }


    // Same language

    if (source !== "auto" && source === target) {

        showMessage(
            "Same language selected",
            "Please choose two different languages."
        );

        return;
    }


    // Loading

    translateButton.disabled = true;

    translateButton.innerHTML =
        "<span>Translating...</span><span>⏳</span>";

    outputText.value = "Translating...";

    translationStatus.textContent =
        "Working...";

    translationInfo.textContent =
        "Please wait";

    detectedLanguage.textContent =
        "Detecting...";

    hideMessage();


    try {

        let sourceLanguage = source;


        // Automatic detection

        if (source === "auto") {

            sourceLanguage =
                await detectLanguage(text);
        }


        detectedLanguage.textContent =
            "Detected: " +
            (
                languageNames[sourceLanguage]
                || sourceLanguage
            );


        // Language pair

        const langPair =
            sourceLanguage + "|" + target;


        // MyMemory API

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(langPair);


        // Timeout

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                15000
            );


        const response =
            await fetch(
                url,
                {
                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                "Translation service returned " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "No translation received."
            );
        }


        const translation =
            data.responseData.translatedText;


        // Show result

        outputText.value =
            translation;

        translationStatus.textContent =
            "Complete";

        translationInfo.textContent =
            "Translation ready";


        // Save history

        saveHistory(
            text,
            sourceLanguage,
            target,
            translation
        );


        showMessage(
            "Translation complete",
            "Your text was translated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        outputText.value = "";

        translationStatus.textContent =
            "Unavailable";

        translationInfo.textContent =
            "Try again";


        if (error.name === "AbortError") {

            showMessage(
                "Request timed out",
                "The translation service took too long to respond. Please try again."
            );

        } else if (!navigator.onLine) {

            showMessage(
                "No internet connection",
                "Please check your internet connection and try again."
            );

        } else {

            showMessage(
                "Translation unavailable",
                "The translation service may be temporarily unavailable. Please try again later."
            );
        }


    } finally {

        translateButton.disabled = false;

        translateButton.innerHTML =
            "<span>Translate</span><span>→</span>";
    }
}


if (translateButton) {

    translateButton.addEventListener(
        "click",
        translateText
    );
}


// ==========================================
// AUTOMATIC LANGUAGE DETECTION
// ==========================================

async function detectLanguage(text) {

    try {

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx" +
            "&sl=auto" +
            "&tl=en"// ==========================================
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
// GET HTML ELEMENTS
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
// ERROR / MESSAGE SYSTEM
// ==========================================

function showMessage(title, message, type = "error") {

    errorBox.classList.remove("hidden");

    messageTitle.textContent = title;
    messageText.textContent = message;

    if (type === "success") {

        messageIcon.textContent = "✓";

        errorBox.style.background = "#ecfdf5";
        errorBox.style.borderColor = "#a7f3d0";
        errorBox.style.color = "#047857";

    } else if (type === "info") {

        messageIcon.textContent = "ℹ️";

        errorBox.style.background = "#eff6ff";
        errorBox.style.borderColor = "#bfdbfe";
        errorBox.style.color = "#1d4ed8";

    } else {

        messageIcon.textContent = "⚠️";

        errorBox.style.background = "#fff7ed";
        errorBox.style.borderColor = "#fed7aa";
        errorBox.style.color = "#9a3412";
    }
}


function hideMessage() {

    errorBox.classList.add("hidden");
}


if (closeMessage) {
    closeMessage.addEventListener("click", hideMessage);
}


// ==========================================
// CHARACTER COUNTER
// ==========================================

if (inputText) {

    inputText.addEventListener("input", function () {

        const length = inputText.value.length;

        charCount.textContent =
            `${length} / 5000`;

        hideMessage();
    });
}


// ==========================================
// TRANSLATION
// ==========================================

async function translateText() {

    const text = inputText.value.trim();

    const source = sourceLang.value;
    const target = targetLang.value;


    // Empty text

    if (!text) {

        showMessage(
            "Text required",
            "Please enter some text before translating."
        );

        inputText.focus();

        return;
    }


    // Same language

    if (source !== "auto" && source === target) {

        showMessage(
            "Same language selected",
            "Please choose two different languages."
        );

        return;
    }


    // Loading

    translateButton.disabled = true;

    translateButton.innerHTML =
        "<span>Translating...</span><span>⏳</span>";

    outputText.value = "Translating...";

    translationStatus.textContent =
        "Working...";

    translationInfo.textContent =
        "Please wait";

    detectedLanguage.textContent =
        "Detecting...";

    hideMessage();


    try {

        let sourceLanguage = source;


        // Automatic detection

        if (source === "auto") {

            sourceLanguage =
                await detectLanguage(text);
        }


        detectedLanguage.textContent =
            "Detected: " +
            (
                languageNames[sourceLanguage]
                || sourceLanguage
            );


        // Language pair

        const langPair =
            sourceLanguage + "|" + target;


        // MyMemory API

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(langPair);


        // Timeout

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                15000
            );


        const response =
            await fetch(
                url,
                {
                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                "Translation service returned " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "No translation received."
            );
        }


        const translation =
            data.responseData.translatedText;


        // Show result

        outputText.value =
            translation;

        translationStatus.textContent =
            "Complete";

        translationInfo.textContent =
            "Translation ready";


        // Save history

        saveHistory(
            text,
            sourceLanguage,
            target,
            translation
        );


        showMessage(
            "Translation complete",
            "Your text was translated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        outputText.value = "";

        translationStatus.textContent =
            "Unavailable";

        translationInfo.textContent =
            "Try again";


        if (error.name === "AbortError") {

            showMessage(
                "Request timed out",
                "The translation service took too long to respond. Please try again."
            );

        } else if (!navigator.onLine) {

            showMessage(
                "No internet connection",
                "Please check your internet connection and try again."
            );

        } else {

            showMessage(
                "Translation unavailable",
                "The translation service may be temporarily unavailable. Please try again later."
            );
        }


    } finally {

        translateButton.disabled = false;

        translateButton.innerHTML =
            "<span>Translate</span><span>→</span>";
    }
}


if (translateButton) {

    translateButton.addEventListener(
        "click",
        translateText
    );
}


// ==========================================
// AUTOMATIC LANGUAGE DETECTION
// ==========================================

async function detectLanguage(text) {

    try {

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx" +
            "&sl=auto" +
            "&tl=en"// ==========================================
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
// GET HTML ELEMENTS
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
// ERROR / MESSAGE SYSTEM
// ==========================================

function showMessage(title, message, type = "error") {

    errorBox.classList.remove("hidden");

    messageTitle.textContent = title;
    messageText.textContent = message;

    if (type === "success") {

        messageIcon.textContent = "✓";

        errorBox.style.background = "#ecfdf5";
        errorBox.style.borderColor = "#a7f3d0";
        errorBox.style.color = "#047857";

    } else if (type === "info") {

        messageIcon.textContent = "ℹ️";

        errorBox.style.background = "#eff6ff";
        errorBox.style.borderColor = "#bfdbfe";
        errorBox.style.color = "#1d4ed8";

    } else {

        messageIcon.textContent = "⚠️";

        errorBox.style.background = "#fff7ed";
        errorBox.style.borderColor = "#fed7aa";
        errorBox.style.color = "#9a3412";
    }
}


function hideMessage() {

    errorBox.classList.add("hidden");
}


if (closeMessage) {
    closeMessage.addEventListener("click", hideMessage);
}


// ==========================================
// CHARACTER COUNTER
// ==========================================

if (inputText) {

    inputText.addEventListener("input", function () {

        const length = inputText.value.length;

        charCount.textContent =
            `${length} / 5000`;

        hideMessage();
    });
}


// ==========================================
// TRANSLATION
// ==========================================

async function translateText() {

    const text = inputText.value.trim();

    const source = sourceLang.value;
    const target = targetLang.value;


    // Empty text

    if (!text) {

        showMessage(
            "Text required",
            "Please enter some text before translating."
        );

        inputText.focus();

        return;
    }


    // Same language

    if (source !== "auto" && source === target) {

        showMessage(
            "Same language selected",
            "Please choose two different languages."
        );

        return;
    }


    // Loading

    translateButton.disabled = true;

    translateButton.innerHTML =
        "<span>Translating...</span><span>⏳</span>";

    outputText.value = "Translating...";

    translationStatus.textContent =
        "Working...";

    translationInfo.textContent =
        "Please wait";

    detectedLanguage.textContent =
        "Detecting...";

    hideMessage();


    try {

        let sourceLanguage = source;


        // Automatic detection

        if (source === "auto") {

            sourceLanguage =
                await detectLanguage(text);
        }


        detectedLanguage.textContent =
            "Detected: " +
            (
                languageNames[sourceLanguage]
                || sourceLanguage
            );


        // Language pair

        const langPair =
            sourceLanguage + "|" + target;


        // MyMemory API

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(langPair);


        // Timeout

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                15000
            );


        const response =
            await fetch(
                url,
                {
                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                "Translation service returned " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "No translation received."
            );
        }


        const translation =
            data.responseData.translatedText;


        // Show result

        outputText.value =
            translation;

        translationStatus.textContent =
            "Complete";

        translationInfo.textContent =
            "Translation ready";


        // Save history

        saveHistory(
            text,
            sourceLanguage,
            target,
            translation
        );


        showMessage(
            "Translation complete",
            "Your text was translated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        outputText.value = "";

        translationStatus.textContent =
            "Unavailable";

        translationInfo.textContent =
            "Try again";


        if (error.name === "AbortError") {

            showMessage(
                "Request timed out",
                "The translation service took too long to respond. Please try again."
            );

        } else if (!navigator.onLine) {

            showMessage(
                "No internet connection",
                "Please check your internet connection and try again."
            );

        } else {

            showMessage(
                "Translation unavailable",
                "The translation service may be temporarily unavailable. Please try again later."
            );
        }


    } finally {

        translateButton.disabled = false;

        translateButton.innerHTML =
            "<span>Translate</span><span>→</span>";
    }
}


if (translateButton) {

    translateButton.addEventListener(
        "click",
        translateText
    );
}


// ==========================================
// AUTOMATIC LANGUAGE DETECTION
// ==========================================

async function detectLanguage(text) {

    try {

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx" +
            "&sl=auto" +
            "&tl=en"// ==========================================
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
// GET HTML ELEMENTS
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
// ERROR / MESSAGE SYSTEM
// ==========================================

function showMessage(title, message, type = "error") {

    errorBox.classList.remove("hidden");

    messageTitle.textContent = title;
    messageText.textContent = message;

    if (type === "success") {

        messageIcon.textContent = "✓";

        errorBox.style.background = "#ecfdf5";
        errorBox.style.borderColor = "#a7f3d0";
        errorBox.style.color = "#047857";

    } else if (type === "info") {

        messageIcon.textContent = "ℹ️";

        errorBox.style.background = "#eff6ff";
        errorBox.style.borderColor = "#bfdbfe";
        errorBox.style.color = "#1d4ed8";

    } else {

        messageIcon.textContent = "⚠️";

        errorBox.style.background = "#fff7ed";
        errorBox.style.borderColor = "#fed7aa";
        errorBox.style.color = "#9a3412";
    }
}


function hideMessage() {

    errorBox.classList.add("hidden");
}


if (closeMessage) {
    closeMessage.addEventListener("click", hideMessage);
}


// ==========================================
// CHARACTER COUNTER
// ==========================================

if (inputText) {

    inputText.addEventListener("input", function () {

        const length = inputText.value.length;

        charCount.textContent =
            `${length} / 5000`;

        hideMessage();
    });
}


// ==========================================
// TRANSLATION
// ==========================================

async function translateText() {

    const text = inputText.value.trim();

    const source = sourceLang.value;
    const target = targetLang.value;


    // Empty text

    if (!text) {

        showMessage(
            "Text required",
            "Please enter some text before translating."
        );

        inputText.focus();

        return;
    }


    // Same language

    if (source !== "auto" && source === target) {

        showMessage(
            "Same language selected",
            "Please choose two different languages."
        );

        return;
    }


    // Loading

    translateButton.disabled = true;

    translateButton.innerHTML =
        "<span>Translating...</span><span>⏳</span>";

    outputText.value = "Translating...";

    translationStatus.textContent =
        "Working...";

    translationInfo.textContent =
        "Please wait";

    detectedLanguage.textContent =
        "Detecting...";

    hideMessage();


    try {

        let sourceLanguage = source;


        // Automatic detection

        if (source === "auto") {

            sourceLanguage =
                await detectLanguage(text);
        }


        detectedLanguage.textContent =
            "Detected: " +
            (
                languageNames[sourceLanguage]
                || sourceLanguage
            );


        // Language pair

        const langPair =
            sourceLanguage + "|" + target;


        // MyMemory API

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(langPair);


        // Timeout

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                15000
            );


        const response =
            await fetch(
                url,
                {
                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                "Translation service returned " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "No translation received."
            );
        }


        const translation =
            data.responseData.translatedText;


        // Show result

        outputText.value =
            translation;

        translationStatus.textContent =
            "Complete";

        translationInfo.textContent =
            "Translation ready";


        // Save history

        saveHistory(
            text,
            sourceLanguage,
            target,
            translation
        );


        showMessage(
            "Translation complete",
            "Your text was translated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        outputText.value = "";

        translationStatus.textContent =
            "Unavailable";

        translationInfo.textContent =
            "Try again";


        if (error.name === "AbortError") {

            showMessage(
                "Request timed out",
                "The translation service took too long to respond. Please try again."
            );

        } else if (!navigator.onLine) {

            showMessage(
                "No internet connection",
                "Please check your internet connection and try again."
            );

        } else {

            showMessage(
                "Translation unavailable",
                "The translation service may be temporarily unavailable. Please try again later."
            );
        }


    } finally {

        translateButton.disabled = false;

        translateButton.innerHTML =
            "<span>Translate</span><span>→</span>";
    }
}


if (translateButton) {

    translateButton.addEventListener(
        "click",
        translateText
    );
}


// ==========================================
// AUTOMATIC LANGUAGE DETECTION
// ==========================================

async function detectLanguage(text) {

    try {

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx" +
            "&sl=auto" +
            "&tl=en"
