const languageNames = {
    "en":"English",
    "hi":"Hindi",
    "bn":"Bengali",
    "fr":"French",
    "es":"Spanish",
    "de":"German",
    "it":"Italian",
    "ja":"Japanese",
    "ko":"Korean",
    "zh-CN":"Chinese",
    "ru":"Russian"
};


// TRANSLATE
async function translateText(){

    let text = document.getElementById("inputText").value.trim();

    let source =
        document.getElementById("sourceLang").value;

    let target =
        document.getElementById("targetLang").value;

    let output =
        document.getElementById("outputText");

    if(text===""){
        alert("Please enter text");
        return;
    }

    output.value = "Translating...";

    try{

        let url =
`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

        let response = await fetch(url);

        let data = await response.json();

        let translation = data[0]
            .map(item => item[0])
            .join("");

        output.value = translation;

        let detectedCode = data[2];

        document.getElementById("detectedLanguage")
        .innerText =
        "Detected Language: " +
        (languageNames[detectedCode] || detectedCode);

        saveHistory(
            text,
            detectedCode,
            target,
            translation
        );

    }
    catch(error){

        output.value =
        "Translation failed.";

    }
}


// COPY
function copyText(){

    let text =
        document.getElementById("outputText").value;

    navigator.clipboard.writeText(text);

    alert("Copied!");
}


// SPEAK
function speakText(){

    let text =
        document.getElementById("outputText").value;

    if(text===""){
        alert("Nothing to speak");
        return;
    }

    let speech =
        new SpeechSynthesisUtterance(text);

    window.speechSynthesis.speak(speech);
}


// SAVE HISTORY
function saveHistory(original, source, target, translation){

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({
        original,
        source,
        target,
        translation,
        time:new Date().toLocaleString()
    });

    if(history.length > 50){
        history = history.slice(0,50);
    }

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    displayHistory();
}


// SHOW HISTORY
function displayHistory(){

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    let list =
        document.getElementById("historyList");

    if(history.length===0){

        list.innerHTML =
            "<p>No history available.</p>";

        return;
    }

    list.innerHTML = "";

    history.forEach((item,index)=>{

        list.innerHTML += `
        <div class="history-item">

            <div class="history-language">
                ${languageNames[item.source]} →
                ${languageNames[item.target]}
            </div>

            <p><b>Input:</b> ${item.original}</p>

            <p><b>Output:</b> ${item.translation}</p>

            <small>${item.time}</small>

            <br>

            <button class="delete-btn"
                onclick="deleteHistory(${index})">
                Delete
            </button>

        </div>
        `;
    });
}


// DELETE
function deleteHistory(index){

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.splice(index,1);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    displayHistory();
}


// CLEAR ALL
function clearHistory(){

    localStorage.removeItem("history");

    displayHistory();
}


// LOAD HISTORY
window.onload = function(){

    displayHistory();

};
