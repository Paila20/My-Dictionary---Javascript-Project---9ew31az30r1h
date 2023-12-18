
const searchInput = document.querySelector(".search-box input");
const searchBtn = document.querySelector(".search-box button");
const result = document.querySelector(".result");
const historyTab = document.querySelector("#history");
const historyContainer = document.querySelector(".history-container");
const searchTab = document.querySelector("#search");
const searchContainer = document.querySelector(".search-container");
const confirmBox = document.querySelector(".confirm");
const URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const randomWordButton = document.getElementById("random");

if (!localStorage.getItem("searches"))
	localStorage.setItem("searches", JSON.stringify([]));

searchInput.addEventListener("input", () => {
	if (searchInput.value == "")
		result.innerHTML =
			"Type a word and press enter or click on search button.";
	else result.innerHTML = "Waiting...";
});
function searchWord() {
	let word = searchInput.value;
	result.innerHTML = "";
	if (word == "") {
		result.innerHTML = "Please Enter A Word!";
		return;
	}
	result.id = "loader";
	word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	searchInput.value = "";
	searchAndDisplay(word);
}
searchBtn.addEventListener("click", searchWord);
searchInput.addEventListener("keydown", (e) => {
	if (e.key == "Enter") searchWord();
});
async function searchAndDisplay(word) {
	try {
		const data = await fetch(`${URL}${word}`);
		const res = await data.json();
		if (res.title) {
			throw new Error("Not Found");
		}
		const meanings = res.map((item) => item.meanings[0]);
		const sampleMeaning = meanings[0].definitions[0].definition;
		const audio = res[0].phonetics.filter((cur) => cur.audio)?.[0]?.audio;
		const wordObj = { word, meanings, audio };
		result.id = "";
		result.style.display = "block";
		addToStorage({ word, meaning: sampleMeaning });
		displayWord(wordObj);
	} catch (e) {
		console.log(e);
		result.id = "";
		result.innerHTML = `No such word found: <span id="not-a-word">${word}</span>`;
	}
}
function addToStorage(obj) {
	let words = JSON.parse(localStorage.getItem("searches"));
	let i = words.findIndex((item) => item.word == obj.word);
	if (i != -1) words.splice(i, 1);
	words = [obj, ...words];
	localStorage.setItem("searches", JSON.stringify(words));
}
function displayWord({ word, meanings, audio }) {
	let audioHtml = `
        <button onClick="handleAudioclick('${audio}')">
            <audio id="play-btn" src="${audio}"></audio>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>
        </button>
    `;

	let html = `
	<div class="header">
	<h2>${word}</h2>
	${audio ? '<p class="audio">' + audioHtml + "</p>" : ""}
	</div><ul>`;
	meanings.forEach((item, index) => {
		let example = item.definitions[0].example;
		let exampleHtml = `<p class="example"><span>Example: </span>${example}</p>`;
		let speech =
			item.partOfSpeech.charAt(0).toUpperCase() +
			item.partOfSpeech.slice(1).toLowerCase();
		html += `
			<li class="meaning">
				<p><span>Part of speech: </span>${speech}</p>
				<p><span>Meaning: </span>${item.definitions[0].definition}</p>
				${example ? exampleHtml : ""}
			</li>
		`;
	});
	result.innerHTML = html + "</ul>";
}
function handleAudioclick(url) {
	document.querySelector("#play-btn").play();
}

historyTab.addEventListener("click", () => {
	historyTab.style.display = "none";
	searchTab.style.display = "block";
	searchContainer.style.display = "none";
	result.style.display = "none";
	historyContainer.style.display = "block";
	displayHistory();
});
searchTab.addEventListener("click", displaySearchPage);
function displaySearchPage() {
	searchTab.style.display = "none";
	historyTab.style.display = "block";
	searchContainer.style.display = "block";
	result.style.display = "flex";
	historyContainer.style.display = "none";
	result.innerHTML = "Type a word and press enter or click on search button.";
}

function displayHistory() {
	const words = JSON.parse(localStorage.getItem("searches"));
	let html = "";
	if (words.length == 0) {
		html = `<div class="empty-history">All you searched words will be availabe here.</div>`;
	} else {
		words.forEach(({ word, meaning }, index) => {
			html += `
			<div class="word">
			<div class="wrap">
			<p class="title" onclick="handleWordCardClick('${word}')">${word}</p>
			<button class="delete" onclick="deleteCard('${index}','${word}')" id=${index}>
			<i class="fa-regular fa-trash-can"></i>
			</button>
			</div>
			<p class="meaning">
			${meaning}
			</p>
				</div>
				`;
		});
	}
	historyContainer.innerHTML = `<h3>Your History:</h3>
		<div class="words">${html}</div>`;
}
function handleWordCardClick(word) {
	displaySearchPage();
	searchInput.value = word;
	searchWord();
}
function deleteCard(index, word) {
	const spanInsideConfirm = document.querySelector(".confirm span");
	spanInsideConfirm.innerHTML = word;
	confirmBox.style.display = "flex";
	const confirmButtons = document.querySelector(".confirm .buttons");
	confirmButtons.addEventListener("click", (e) => {
		if (e.target.innerHTML == "Yes") {
			confirmBox.style.display = "none";
			const words = JSON.parse(localStorage.getItem("searches"));
			words.splice(index, 1);
			localStorage.setItem("searches", JSON.stringify(words));
			displayHistory();
		} else if (e.target.innerHTML == "No") {
			shouldDelete = false;
			confirmBox.style.display = "none";
		}
	});
}

async function generateRandomWord() {
	const data = await (
		await fetch("https://random-word-api.herokuapp.com/word")
	).json();
	let word = data[0];
	result.innerHTML = "";
	result.id = "loader";
	word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	searchInput.value = "";
	const dictResult = await fetch(`${URL}${word}`);
	const res = await dictResult.json();
	if (res.title) {
		generateRandomWord();
	}
	const meanings = res.map((item) => item.meanings[0]);
	const sampleMeaning = meanings[0].definitions[0].definition;
	const audio = res[0].phonetics.filter((cur) => cur.audio)?.[0]?.audio;
	const wordObj = { word, meanings, audio };
	result.id = "";
	result.style.display = "block";
	addToStorage({ word, meaning: sampleMeaning });
	displayWord(wordObj);
}

randomWordButton.addEventListener("click", generateRandomWord);
