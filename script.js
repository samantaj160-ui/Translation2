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
// ELEMENTS
// ==========================================

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");

const translateButton = document.getElementById("translateButton");

const swapButton = document.getElementById("swapButton");

const micButton = document.getElementById("micButton");

const speakerButton = document.getElementById("speakerButton");

const copyButton = document.getElementById("copyButton");

const clearInput = document.getElementById("clearInput");

const charCount = document.getElementById("charCount");

const detectedLanguage = document.getElementById("detectedLanguage");

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


closeMessage.addEventListener("click", hideMessage);


// ==========================================
// CHARACTER COUNTER
// ==========================================

inputText.addEventListener("input", function () {

    const length = inputText.value.length;

    charCount.textContent = `${length} / 5000`;

    hideMessage();
});


// ==========================================
// TRANSLATION
// ==========================================

async function translateText() {

    const text = inputText.value.trim();

    const source = sourceLang.value;
    const target = targetLang.value;


    // Validate input

    if (!text) {

        showMessage(
            "Text required",
            "Please enter some text before translating."
        );

        inputText.focus();

        return;
    }


    // Prevent same language

    if (source !== "auto" && source === target) {

        showMessage(
            "Same language selected",
            "Please choose two different languages."
        );

        return;
    }


    // Start loading

    translateButton.disabled = true;

    translateButton.innerHTML =
        "<span>Translating...</span> ⏳";

    outputText.value = "Translating...";

    translationStatus.textContent = "Working...";
    translationInfo.textContent = "Please wait";

    detectedLanguage.textContent = "Detecting...";

    hideMessage();


    try {

        let sourceLanguage = source;


        // Automatic language detection

        if (source === "auto") {

            sourceLanguage = await detectLanguage(text);
        }


        detectedLanguage.textContent =
            "Detected: " +
            (languageNames[sourceLanguage] || sourceLanguage);


        // API language pair

        const langPair =
            sourceLanguage + "|" + target;


        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(langPair);


        // Timeout protection

        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => controller.abort(), 15000);


        const response =
            await fetch(url, {
                signal: controller.signal
            });


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


        // Show translation

        outputText.value = translation;

        translationStatus.textContent = "Complete";
        translationInfo.textContent = "Translation ready";


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

        console.error(error);


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


translateButton.addEventListener(
    "click",
    translateText
);


// ==========================================
// LANGUAGE DETECTION
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
                "Detection failed"
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
// SWAP LANGUAGES + TEXT
// ==========================================

swapButton.addEventListener(
    "click",
    function () {

        // Auto detect cannot be swapped directly

        if (sourceLang.value === "auto") {

            showMessage(
                "Cannot swap Auto Detect",
                "Translate the text first, or select a specific source language before swapping.",
                "info"
            );

            return;
        }


        // Swap languages

        const oldSource =
            sourceLang.value;

        sourceLang.value =
            targetLang.value;

        targetLang.value =
            oldSource;


        // Swap text

        const oldInput =
            inputText.value;

        inputText.value =
            outputText.value;

        outputText.value =
            oldInput;


        // Update counter

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


// ==========================================
// MICROPHONE / SPEECH TO TEXT
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


    micButton.addEventListener(
        "click",
        startVoiceInput
    );


} else {

    micButton.addEventListener(
        "click",
        function () {

            showMessage(
                "Voice input not supported",
                "Your browser does not support speech recognition. Try Google Chrome or Microsoft Edge."
            );

        }
    );
}


function startVoiceInput() {

    if (!recognition) return;


    const language =
        sourceLang.value;


    // Auto detect cannot specify speech language

    if (language === "auto") {

        recognition.lang = "en-US";

    } else {

        recognition.lang =
            getSpeechLanguage(language);
    }


    recognition.start();


    micButton.textContent = "🔴";

    showMessage(
        "Listening...",
        "Speak clearly into your microphone.",
        "info"
    );


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;


            inputText.value =
                transcript;


            charCount.textContent =
                `${transcript.length} / 5000`;


            hideMessage();
        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech error:",
                event.error
            );


            showMessage(
                "Voice input failed",
                "Microphone access may be blocked or speech could not be recognized."
            );
        };


    recognition.onend =
        function () {

            micButton.textContent = "🎤";
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

speakerButton.addEventListener(
    "click",
    function () {

        const text =
            outputText.value.trim();


        if (!text) {

            showMessage(
                "Nothing to read",
                "Translate some text first."
            );

            return;
        }


        if (!("speechSynthesis" in window)) {

            showMessage(
                "Text-to-speech unavailable",
                "Your browser does not support text-to-speech."
            );

            return;
        }


        // Stop previous speech

        speechSynthesis.cancel();


        const speech =
            new SpeechSynthesisUtterance(text);


        speech.lang =
            getSpeechLanguage(
                targetLang.value
            );


        speech.rate = 0.9;

        speech.pitch = 1;


        speech.onstart =
            function () {

                speakerButton.textContent =
                    "⏹️";
            };


        speech.onend =
            function () {

                speakerButton.textContent =
                    "🔊";
            };


        speech.onerror =
            function () {

                speakerButton.textContent =
                    "🔊";

                showMessage(
                    "Speech failed",
                    "The browser could not read the translation aloud."
                );
            };


        speechSynthesis.speak(speech);


        // Clicking again stops speech

        speakerButton.onclick =
            function () {

                speechSynthesis.cancel();

                speakerButton.textContent =
                    "🔊";

                speakerButton.onclick =
                    arguments.callee;
            };
    }
);


// ==========================================
// COPY
// ==========================================

copyButton.addEventListener(
    "click",
    async function () {

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

            showMessage(
                "Copy failed",
                "Your browser did not allow clipboard access."
            );
        }
    }
);


// ==========================================
// CLEAR INPUT
// ==========================================

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


// ==========================================
// HISTORY
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


    // Keep last 20

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
            (item, index) => `

            <div class="history-item">

                <div class="history-languages">
                    ${escapeHTML(
                        languageNames[item.source]
                        || item.source
                    )}

                    →

                    ${escapeHTML(
                        languageNames[item.target]
                        || item.target
                    )}
                </div>

                <div class="history-original">
                    ${escapeHTML(
                        item.original
                    )}
                </div>

                <div class="history-translation">
                    ${escapeHTML(
                        item.translation
                    )}
                </div>

                <small>
                    ${escapeHTML(item.date)}
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
        `
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


    sourceLang.value =
        item.source;

    targetLang.value =
        item.target;


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
// LOAD HISTORY WHEN PAGE OPENS
// ==========================================

displayHistory();
