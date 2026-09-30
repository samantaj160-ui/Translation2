/* =========================================================
   LINGUATRANSLATE - TRANSLATION SCRIPT
   ========================================================= */

const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const translateButton = document.getElementById("translateButton");
const swapButton = document.getElementById("swapButton");

const micButton = document.getElementById("micButton");
const speakerButton = document.getElementById("speakerButton");
const copyButton = document.getElementById("copyButton");

const clearInput = document.getElementById("clearInput");
const clearHistory = document.getElementById("clearHistory");

const charCount = document.getElementById("charCount");
const detectedLanguage = document.getElementById("detectedLanguage");

const translationStatus = document.getElementById("translationStatus");
const translationInfo = document.getElementById("translationInfo");

const errorBox = document.getElementById("errorBox");
const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const closeMessage = document.getElementById("closeMessage");

const historyList = document.getElementById("historyList");

const HISTORY_KEY = "linguaTranslateHistory";

let isTranslating = false;
let recognition = null;


/* =========================================================
   LANGUAGE NAMES
   ========================================================= */

const languageNames = {
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


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function showMessage(title, message, icon = "⚠️") {

    messageIcon.textContent = icon;
    messageTitle.textContent = title;
    messageText.textContent = message;

    errorBox.classList.remove("hidden");
}


function hideMessage() {
    errorBox.classList.add("hidden");
}


closeMessage.addEventListener("click", hideMessage);


/* =========================================================
   CHARACTER COUNTER
   ========================================================= */

function updateCharacterCount() {

    const length = inputText.value.length;

    charCount.textContent = `${length} / 5000`;
}

inputText.addEventListener("input", updateCharacterCount);


/* =========================================================
   TRANSLATION
   ========================================================= */

async function translateText() {

    const text = inputText.value.trim();
    const target = targetLang.value;
    let source = sourceLang.value;

    hideMessage();

    if (!text) {

        showMessage(
            "Enter some text",
            "Please enter text before starting the translation.",
            "✏️"
        );

        inputText.focus();
        return;
    }

    if (isTranslating) {
        return;
    }

    if (source === target) {

        outputText.value = text;

        translationStatus.textContent = "Completed";
        translationInfo.textContent = "Same language";

        saveHistory(
            text,
            text,
            source,
            target
        );

        return;
    }


    isTranslating = true;

    translateButton.disabled = true;
    translateButton.innerHTML = `
        <span>Translating...</span>
        <span>⌛</span>
    `;

    translationStatus.textContent = "Translating...";
    translationInfo.textContent = "Please wait";

    try {

        /* -----------------------------------------
           AUTO DETECTION
           ----------------------------------------- */

        if (source === "auto") {

            source = await detectLanguage(text);

            detectedLanguage.textContent =
                `Detected: ${languageNames[source] || source}`;
        }


        /* -----------------------------------------
           MYMEMORY TRANSLATION API
           ----------------------------------------- */

        const langPair = `${source}|${target}`;

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" + encodeURIComponent(text) +
            "&langpair=" + encodeURIComponent(langPair);


        const response = await fetch(url);


        if (!response.ok) {
            throw new Error(
                `Translation service returned ${response.status}`
            );
        }


        const data = await response.json();


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {
            throw new Error("No translation was returned.");
        }


        let translation =
            data.responseData.translatedText;


        /* -----------------------------------------
           CLEAN TRANSLATION
           ----------------------------------------- */

        translation = decodeHTMLEntities(translation);


        outputText.value = translation;

        translationStatus.textContent = "Completed";

        translationInfo.textContent =
            `${languageNames[source] || source} → ${languageNames[target] || target}`;


        /* -----------------------------------------
           SAVE HISTORY
           ----------------------------------------- */

        saveHistory(
            text,
            translation,
            source,
            target
        );


    } catch (error) {

        console.error("Translation error:", error);

        outputText.value = "";

        translationStatus.textContent = "Failed";
        translationInfo.textContent = "Translation failed";

        showMessage(
            "Translation failed",
            "The translation service could not be reached. Please check your internet connection and try again.",
            "⚠️"
        );

    } finally {

        isTranslating = false;

        translateButton.disabled = false;

        translateButton.innerHTML = `
            <span>Translate</span>
            <span>→</span>
        `;
    }
}


/* =========================================================
   LANGUAGE DETECTION
   ========================================================= */

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


        const response = await fetch(url);


        if (!response.ok) {
            throw new Error("Detection failed");
        }


        const data = await response.json();


        if (
            Array.isArray(data) &&
            data[2]
        ) {

            return data[2];
        }


    } catch (error) {

        console.warn(
            "Automatic language detection unavailable."
        );
    }


    /* Fallback */

    return "en";
}


/* =========================================================
   HTML ENTITY DECODER
   ========================================================= */

function decodeHTMLEntities(text) {

    const textarea = document.createElement("textarea");

    textarea.innerHTML = text;

    return textarea.value;
}


/* =========================================================
   TRANSLATE BUTTON
   ========================================================= */

translateButton.addEventListener(
    "click",
    translateText
);


/* =========================================================
   ENTER KEY
   ========================================================= */

inputText.addEventListener("keydown", function(event) {

    if (
        event.key === "Enter" &&
        event.ctrlKey
    ) {

        event.preventDefault();

        translateText();
    }
});


/* =========================================================
   SWAP LANGUAGES
   ========================================================= */

swapButton.addEventListener("click", function() {

    hideMessage();

    if (sourceLang.value === "auto") {

        showMessage(
            "Cannot swap",
            "Automatic detection must be changed to a specific language before swapping.",
            "🔄"
        );

        return;
    }


    const oldSource = sourceLang.value;

    sourceLang.value = targetLang.value;

    targetLang.value = oldSource;


    /* Swap text */

    const oldInput = inputText.value;

    inputText.value = outputText.value;

    outputText.value = oldInput;


    updateCharacterCount();


    detectedLanguage.textContent =
        `From: ${languageNames[sourceLang.value] || sourceLang.value}`;

    translationStatus.textContent = "Ready";

    translationInfo.textContent = "Ready";
});


/* =========================================================
   CLEAR INPUT
   ========================================================= */

clearInput.addEventListener("click", function() {

    inputText.value = "";

    outputText.value = "";

    updateCharacterCount();

    detectedLanguage.textContent = "Ready";

    translationStatus.textContent = "Ready";

    translationInfo.textContent = "Ready";

    hideMessage();

    inputText.focus();
});


/* =========================================================
   COPY TRANSLATION
   ========================================================= */

copyButton.addEventListener("click", async function() {

    const text = outputText.value.trim();

    if (!text) {

        showMessage(
            "Nothing to copy",
            "Translate some text first.",
            "📋"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(text);

        translationInfo.textContent = "Copied ✓";


        setTimeout(() => {

            translationInfo.textContent = "Ready";

        }, 2000);


    } catch (error) {

        /* Fallback for older browsers */

        outputText.select();

        document.execCommand("copy");

        translationInfo.textContent = "Copied ✓";

    }
});


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

const speechLanguageMap = {

    en: "en-US",
    hi: "hi-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    pa: "pa-IN",
    ur: "ur-PK",
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


speakerButton.addEventListener("click", function() {

    const text = outputText.value.trim();

    if (!text) {

        showMessage(
            "Nothing to speak",
            "Translate some text first.",
            "🔊"
        );

        return;
    }


    if (!("speechSynthesis" in window)) {

        showMessage(
            "Speech not supported",
            "Your browser does not support text-to-speech.",
            "🔊"
        );

        return;
    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    utterance.lang =
        speechLanguageMap[targetLang.value] ||
        "en-US";


    utterance.rate = 0.9;
    utterance.pitch = 1;


    utterance.onstart = function() {

        translationInfo.textContent =
            "Speaking... 🔊";
    };


    utterance.onend = function() {

        translationInfo.textContent =
            "Ready";
    };


    utterance.onerror = function() {

        translationInfo.textContent =
            "Speech unavailable";

        showMessage(
            "Speech error",
            "The browser could not read the translation aloud.",
            "🔊"
        );
    };


    window.speechSynthesis.speak(
        utterance
    );
});


/* =========================================================
   VOICE INPUT
   ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    micButton.addEventListener(
        "click",
        function() {

            hideMessage();

            let language =
                sourceLang.value;


            if (language === "auto") {
                language = "en";
            }


            recognition.lang =
                speechLanguageMap[language] ||
                "en-US";


            try {

                recognition.start();

                micButton.textContent = "🔴";

                detectedLanguage.textContent =
                    "Listening...";

            } catch (error) {

                console.warn(
                    "Microphone already running."
                );
            }
        }
    );


    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;


        inputText.value +=
            (inputText.value ? " " : "") +
            transcript;


        updateCharacterCount();

        detectedLanguage.textContent =
            "Voice input added ✓";
    };


    recognition.onend = function() {

        micButton.textContent = "🎤";
    };


    recognition.onerror = function(event) {

        micButton.textContent = "🎤";


        if (event.error === "not-allowed") {

            showMessage(
                "Microphone permission denied",
                "Please allow microphone access in your browser settings.",
                "🎤"
            );

        } else {

            showMessage(
                "Voice input error",
                "Unable to recognize your voice. Please try again.",
                "🎤"
            );
        }
    };


} else {

    micButton.addEventListener(
        "click",
        function() {

            showMessage(
                "Voice input unavailable",
                "Your browser does not support speech recognition.",
                "🎤"
            );
        }
    );
}


/* =========================================================
   HISTORY
   ========================================================= */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(HISTORY_KEY)
        ) || [];

    } catch (error) {

        return [];
    }
}


function saveHistory(
    original,
    translation,
    source,
    target
) {

    if (!original || !translation) {
        return;
    }


    const history =
        getHistory();


    const item = {

        id: Date.now(),

        original: original,

        translation: translation,

        source: source,

        target: target,

        time: new Date().toLocaleString()
    };


    history.unshift(item);


    /* Keep latest 20 */

    const limitedHistory =
        history.slice(0, 20);


    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(limitedHistory)
    );


    renderHistory();
}


/* =========================================================
   RENDER HISTORY
   ========================================================= */

function renderHistory() {

    const history =
        getHistory();


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div>📝</div>
                <p>No translation history yet</p>
            </div>
        `;

        return;
    }


    historyList.innerHTML = "";


    history.forEach(function(item) {

        const historyItem =
            document.createElement("div");

        historyItem.className =
            "history-item";


        historyItem.innerHTML = `

            <div class="history-content">

                <div class="history-language">
                    ${escapeHTML(
                        languageNames[item.source] ||
                        item.source
                    )}
                    →
                    ${escapeHTML(
                        languageNames[item.target] ||
                        item.target
                    )}
                </div>

                <div class="history-original">
                    ${escapeHTML(item.original)}
                </div>

                <div class="history-translation">
                    ${escapeHTML(item.translation)}
                </div>

                <small>
                    ${escapeHTML(item.time)}
                </small>

            </div>

            <div class="history-actions">

                <button
                    class="history-use"
                    data-id="${item.id}"
                    title="Use translation">
                    ↩
                </button>

                <button
                    class="history-copy"
                    data-id="${item.id}"
                    title="Copy translation">
                    📋
                </button>

                <button
                    class="history-delete"
                    data-id="${item.id}"
                    title="Delete">
                    🗑
                </button>

            </div>
        `;


        historyList.appendChild(
            historyItem
        );
    });
}


/* =========================================================
   HISTORY BUTTON ACTIONS
   ========================================================= */

historyList.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const id =
            Number(button.dataset.id);


        const history =
            getHistory();


        const item =
            history.find(
                entry => entry.id === id
            );


        if (!item) {
            return;
        }


        /* USE */

        if (
            button.classList.contains(
                "history-use"
            )
        ) {

            inputText.value =
                item.original;

            outputText.value =
                item.translation;

            sourceLang.value =
                item.source === "auto"
                    ? "auto"
                    : item.source;

            targetLang.value =
                item.target;

            updateCharacterCount();

            translationStatus.textContent =
                "Completed";

            translationInfo.textContent =
                "From history";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }


        /* COPY */

        if (
            button.classList.contains(
                "history-copy"
            )
        ) {

            try {

                await navigator.clipboard.writeText(
                    item.translation
                );

                button.textContent = "✓";

                setTimeout(() => {

                    button.textContent = "📋";

                }, 1500);

            } catch (error) {

                console.error(error);
            }
        }


        /* DELETE */

        if (
            button.classList.contains(
                "history-delete"
            )
        ) {

            const updated =
                history.filter(
                    entry => entry.id !== id
                );


            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(updated)
            );


            renderHistory();
        }

    }
);


/* =========================================================
   CLEAR ALL HISTORY
   ========================================================= */

clearHistory.addEventListener(
    "click",
    function() {

        const history =
            getHistory();


        if (history.length === 0) {
            return;
        }


        localStorage.removeItem(
            HISTORY_KEY
        );


        renderHistory();
    }
);


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


/* =========================================================
   INITIALIZE
   ========================================================= */

updateCharacterCount();

renderHistory();

console.log(
    "LinguaTranslate JavaScript loaded successfully."
);
