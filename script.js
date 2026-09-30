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
            "&tl=en" +
            "&dt=t" +
            "&q=" +
            encodeURIComponent(text);


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => controller.abort(),
                8000
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
                "Language detection failed"
            );
        }


        const data =
            await response.json();


        if (data[2]) {

            return data[2];
        }


    } catch (error) {

        console.log(
            "Automatic detection failed:",
            error
        );
    }


    // Fallback

    return "en";
}


// ==========================================
// SWAP LANGUAGES AND TEXT
// ==========================================

if (swapButton) {

    swapButton.addEventListener(
        "click",
        function () {

            // Auto Detect cannot be swapped directly

            if (sourceLang.value === "auto") {

                showMessage(
                    "Cannot swap Auto Detect",
                    "Select a specific source language before using swap.",
                    "info"
                );

                return;
            }


            // Save old values

            const oldSource =
                sourceLang.value;

            const oldTarget =
                targetLang.value;

            const oldInput =
                inputText.value;

            const oldOutput =
                outputText.value;


            // Swap languages

            sourceLang.value =
                oldTarget;

            targetLang.value =
                oldSource;


            // Swap text

            inputText.value =
                oldOutput;

            outputText.value =
                oldInput;


            // Update character counter

            charCount.textContent =
                `${inputText.value.length} / 5000`;


            detectedLanguage.textContent =
                "Ready";

            translationStatus.textContent =
                "Ready";

            translationInfo.textContent =
                "Swapped";


            hideMessage();
        }
    );
}


// ==========================================
// SPEECH RECOGNITION / MICROPHONE
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    if (micButton) {

        micButton.addEventListener(
            "click",
            startVoiceInput
        );
    }

} else {

    if (micButton) {

        micButton.addEventListener(
            "click",
            function () {

                showMessage(
                    "Voice input not supported",
                    "Your browser does not support speech recognition. Try Google Chrome."
                );
            }
        );
    }
}


// ==========================================
// START VOICE INPUT
// ==========================================

function startVoiceInput() {

    if (!recognition) return;


    let language =
        sourceLang.value;


    // Auto Detect speech fallback

    if (language === "auto") {

        language = "en";

        showMessage(
            "Listening",
            "Speak in English, or select your speech language before using the microphone.",
            "info"
        );

    } else {

        showMessage(
            "Listening...",
            "Speak clearly into your microphone.",
            "info"
        );
    }


    recognition.lang =
        getSpeechLanguage(language);


    try {

        recognition.start();

        micButton.textContent =
            "🔴";

    } catch (error) {

        console.log(
            "Microphone already active."
        );
    }


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;


            inputText.value =
                transcript;


            charCount.textContent =
                `${transcript.length} / 5000`;


            showMessage(
                "Voice captured",
                "Your speech has been converted to text.",
                "success"
            );
        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            micButton.textContent =
                "🎤";


            if (event.error === "not-allowed") {

                showMessage(
                    "Microphone permission denied",
                    "Allow microphone access in your browser settings and try again."
                );

            } else if (event.error === "no-speech") {

                showMessage(
                    "No speech detected",
                    "Please speak clearly and try again."
                );

            } else if (event.error === "network") {

                showMessage(
                    "Voice service unavailable",
                    "Check your internet connection and try again."
                );

            } else {

                showMessage(
                    "Voice input failed",
                    "The browser could not recognize your speech."
                );
            }
        };


    recognition.onend =
        function () {

            micButton.textContent =
                "🎤";
        };
}


// ==========================================
// SPEECH LANGUAGE CODES
// ==========================================

function getSpeechLanguage(language) {

    const speechLanguages = {

        en: "en-US",

        hi: "hi-IN",

        bn: "bn-IN",

        ta: "ta-IN",

        te: "te-IN",

        mr: "mr-IN",

        gu: "gu-IN",

        pa: "pa-IN",

        ur: "ur-IN",

        fr: "fr-FR",

        es: "es-ES",

        de: "de-DE",

        it: "it-IT",

        pt: "pt-PT",

        ru: "ru-RU",

        ja: "ja-JP",

        ko: "ko-KR",

        "zh-CN": "zh-CN",

        ar: "ar-SA"
    };


    return speechLanguages[language]
        || "en-US";
}


// ==========================================
// TEXT TO SPEECH
// ==========================================

if (speakerButton) {

    speakerButton.addEventListener(
        "click",
        speakTranslation
    );
}


function speakTranslation() {

    const text =
        outputText.value.trim();


    // Empty output

    if (!text) {

        showMessage(
            "Nothing to play",
            "Translate some text first."
        );

        return;
    }


    // Browser support

    if (
        !("speechSynthesis" in window) ||
        !("SpeechSynthesisUtterance" in window)
    ) {

        showMessage(
            "Voice output not supported",
            "Your browser does not support text-to-speech."
        );

        return;
    }


    // Stop existing speech

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    // Set output language

    let speechLanguage =
        targetLang.value;


    if (speechLanguage === "auto") {

        speechLanguage = "en";
    }


    utterance.lang =
        getSpeechLanguage(
            speechLanguage
        );


    utterance.rate = 0.85;

    utterance.pitch = 1;

    utterance.volume = 1;


    // Change icon

    speakerButton.textContent =
        "⏹️";


    utterance.onstart =
        function () {

            translationInfo.textContent =
                "Speaking...";
        };


    utterance.onend =
        function () {

            speakerButton.textContent =
                "🔊";

            translationInfo.textContent =
                "Translation ready";
        };


    utterance.onerror =
        function (event) {

            console.error(
                "Text-to-speech error:",
                event
            );


            speakerButton.textContent =
                "🔊";


            translationInfo.textContent =
                "Voice unavailable";


            showMessage(
                "Voice playback failed",
                "Check your phone volume and browser speech settings, then try again."
            );
        };


    // Speak

    window.speechSynthesis.speak(
        utterance
    );
}


// ==========================================
// COPY TRANSLATION
// ==========================================

if (copyButton) {

    copyButton.addEventListener(
        "click",
        copyTranslation
    );
}


async function copyTranslation() {

    const text =
        outputText.value.trim();


    if (!text) {

        showMessage(
            "Nothing to copy",
            "Translate something first."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        showMessage(
            "Copied",
            "Translation copied to clipboard.",
            "success"
        );


    } catch (error) {

        // Fallback

        try {

            outputText.select();

            document.execCommand("copy");

            showMessage(
                "Copied",
                "Translation copied to clipboard.",
                "success"
            );

        } catch (copyError) {

            showMessage(
                "Copy failed",
                "Your browser did not allow clipboard access."
            );
        }
    }
}


// ==========================================
// CLEAR INPUT
// ==========================================

if (clearInput) {

    clearInput.addEventListener(
        "click",
        function () {

            inputText.value = "";

            charCount.textContent =
                "0 / 5000";

            detectedLanguage.textContent =
                "Ready";

            hideMessage();

            inputText.focus();
        }
    );
}


// ==========================================
// SAVE HISTORY
// ==========================================

function saveHistory(
    original,
    source,
    target,
    translation
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    const item = {

        original: original,

        source: source,

        target: target,

        translation: translation,

        date:
            new Date().toLocaleString()
    };


    history.unshift(item);


    // Keep maximum 20 records

    history =
        history.slice(0, 20);


    localStorage.setItem(
        "translationHistory",
        JSON.stringify(history)
    );


    displayHistory();
}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div>📝</div>
                <p>No translation history yet</p>
            </div>
        `;

        return;
    }


    historyList.innerHTML =
        history.map(
            (item, index) => {

                const sourceName =
                    languageNames[item.source]
                    || item.source
                    || "Unknown";

                const targetName =
                    languageNames[item.target]
                    || item.target
                    || "Unknown";


                return `

                <div class="history-item">

                    <div class="history-languages">

                        ${escapeHTML(sourceName)}

                        →

                        ${escapeHTML(targetName)}

                    </div>


                    <div class="history-original">

                        Input:
                        ${escapeHTML(item.original)}

                    </div>


                    <div class="history-translation">

                        Output:
                        ${escapeHTML(item.translation)}

                    </div>


                    <small>

                        ${escapeHTML(
                            item.date || ""
                        )}

                    </small>


                    <div class="history-actions">

                        <button
                            onclick="useHistory(${index})">

                            ↻ Use

                        </button>


                        <button
                            onclick="copyHistory(${index})">

                            📋 Copy

                        </button>


                        <button
                            onclick="deleteHistory(${index})">

                            🗑 Delete

                        </button>

                    </div>

                </div>

                `;
            }
        ).join("");
}


// ==========================================
// USE HISTORY
// ==========================================

function useHistory(index) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    const item =
        history[index];


    if (!item) return;


    inputText.value =
        item.original;


    outputText.value =
        item.translation;


    // Only set valid languages

    if (
        sourceLang.querySelector(
            `option[value="${item.source}"]`
        )
    ) {

        sourceLang.value =
            item.source;
    }


    if (
        targetLang.querySelector(
            `option[value="${item.target}"]`
        )
    ) {

        targetLang.value =
            item.target;
    }


    charCount.textContent =
        `${item.original.length} / 5000`;


    detectedLanguage.textContent =
        "History";

    translationStatus.textContent =
        "Complete";

    translationInfo.textContent =
        "From history";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// COPY HISTORY
// ==========================================

async function copyHistory(index) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    if (!history[index]) return;


    try {

        await navigator.clipboard.writeText(
            history[index].translation
        );


        showMessage(
            "Copied",
            "Translation copied to clipboard.",
            "success"
        );

    } catch (error) {

        showMessage(
            "Copy failed",
            "Could not copy the translation."
        );
    }
}


// ==========================================
// DELETE HISTORY
// ==========================================

function deleteHistory(index) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    history.splice(index, 1);


    localStorage.setItem(
        "translationHistory",
        JSON.stringify(history)
    );


    displayHistory();
}


// ==========================================
// CLEAR ALL HISTORY
// ==========================================

if (clearHistory) {

    clearHistory.addEventListener(
        "click",
        function () {

            const history =
                JSON.parse(
                    localStorage.getItem(
                        "translationHistory"
                    )
                ) || [];


            if (history.length === 0) {

                showMessage(
                    "History is already empty",
                    "There is nothing to delete.",
                    "info"
                );

                return;
            }


            localStorage.removeItem(
                "translationHistory"
            );


            displayHistory();


            showMessage(
                "History cleared",
                "All translation history has been removed.",
                "success"
            );
        }
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


// ==========================================
// LOAD HISTORY ON PAGE START
// ==========================================

displayHistory();
