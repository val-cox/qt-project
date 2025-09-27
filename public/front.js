(async function () {
  // ========================================================
  // CONFIGURATION
  // Central object holding DOM references, URLs, assets, and timing values.
  // ========================================================
  const CONFIG = {
    elements: {
      startButton: document.getElementById("start_button"),
      audio: document.getElementById("qt_audio"),
      storyChoiceTable: document.getElementById("story_choice_table"),
      faceImage: document.getElementById("qt_face")
    },
    urls: {
      schedule: "",                       // placeholder for future emotion schedule
      storyIndex: "/stories/index.json",  // index of all story files
      audioBase: "/audio/",
      qtBase: "/qt/"
    },
    emotions: [
      "affection", "colère", "confusion", "embarassement",
      "joie", "neutre", "peur", "surprise", "timide", "tristesse"
    ],
    emotionImageMap: { affection: "affection.png", colère: "colère.png", confusion: "confusion.png", cri: "cri.png", embarassement: "embarassement.png", joie: "joie.png", neutre: "neutre.png", peur: "peur.png", surprise: "surprise.png", timide: "timide.png", tristesse: "tristesse.png" },
    emotionAudioMap: { /* maps emotion → audio file */ },
    stories: [],
    faceImages: { blinkingClosed: "normal.png", blinkingOpen: "normal4.png", normalClosed: "normal2.png", normalOpen: "normal3.png" },
    intervals: {
      clock: 100,           // update clock every 100ms
      blink: 3000,          // blink every 3s
      blinkDuration: 200,   // blink lasts 200ms
      mouthClose: 500,      // close mouth briefly every 500ms
      mouthCloseDuration: 250,
      emotionDelay: 1000    // how long an emotion remains displayed
    },
  };

  // ========================================================
  // STATE VARIABLES
  // Track current animation and playback state
  // ========================================================
  let timeouts = [];
  let blinking = false;
  let closedMouth = false;
  let keepMouthShut = true;
  let currentEmotion = null;
  let isPaused = false;
  let hasEnded = false;

  let emotionSchedule = [];

  // ========================================================
  // HELPER FUNCTIONS
  // ========================================================

  // Display the given emotion temporarily and update face image
  function displayEmotion(emotion) {
    if (CONFIG.emotionImageMap[emotion]) {
      currentEmotion = emotion;
      CONFIG.elements.faceImage.src = `${CONFIG.urls.qtBase}${CONFIG.emotionImageMap[currentEmotion]}`;
      setTimeout(() => { currentEmotion = null; }, CONFIG.intervals.emotionDelay);
    }
  }
  
  // Main animation loop: update face image according to blink/mouth state
  function startClock() {
    // Update face every 100ms
    setInterval(() => {
      if (!isPaused && !currentEmotion) {
        CONFIG.elements.faceImage.src = (blinking)
          ? (closedMouth || keepMouthShut)
            ? `${CONFIG.urls.qtBase}${CONFIG.faceImages.blinkingClosed}`
            : `${CONFIG.urls.qtBase}${CONFIG.faceImages.blinkingOpen}`
          : (closedMouth || keepMouthShut)
            ? `${CONFIG.urls.qtBase}${CONFIG.faceImages.normalClosed}`
            : `${CONFIG.urls.qtBase}${CONFIG.faceImages.normalOpen}`;
      }
    }, CONFIG.intervals.clock);

    // Blink cycle
    setInterval(() => {
      blinking = true;
      setTimeout(() => { blinking = false; }, CONFIG.intervals.blinkDuration);
    }, CONFIG.intervals.blink);

    // Mouth movement cycle
    setInterval(() => {
      closedMouth = true;
      setTimeout(() => { closedMouth = false; }, CONFIG.intervals.mouthCloseDuration);
    }, CONFIG.intervals.mouthClose);
  }

  // Schedule upcoming emotion cues aligned with audio playback
  function scheduleEmotions() {
    clearScheduledEmotions();
    emotionSchedule.forEach(timepoint => {
      const delay = (timepoint.time - CONFIG.elements.audio.currentTime) * 1000;
      if (!timepoint.consumed && delay > 0) {
        const timeoutId = setTimeout(() => {
          timepoint.consumed = true;
          displayEmotion(timepoint.emotion);
        }, delay);
        timeouts.push(timeoutId);
      }
    });
  }

  // Cancel any pending emotion events
  function clearScheduledEmotions() {
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    timeouts = [];
  }

  // Control playback + emotion scheduling
  function pauseAudio() {
    CONFIG.elements.audio.pause();
    isPaused = true;
    keepMouthShut = true;
    clearScheduledEmotions();
  }

  function resumeAudio() {
    isPaused = false;
    if (!hasEnded) {
      keepMouthShut = false;
      CONFIG.elements.audio.play();
      scheduleEmotions();
    }
  }

  // Fetch list of stories, build story choice buttons dynamically
  async function downloadStories() {
    const dataStoryIndex = await fetch(CONFIG.urls.storyIndex);
    const stories = await dataStoryIndex.json();

    for (let storyUrl of stories) {
      const dataStory = await fetch(storyUrl);
      const story = await dataStory.json();
      CONFIG.stories.push(story);
    }

    // Populate choice table
    CONFIG.elements.storyChoiceTable.innerHTML = "";
    for (let index in CONFIG.stories) {
      let story = CONFIG.stories[index];
      let tableRow = document.createElement("tr");
      let tableRowData = document.createElement("td");
      let tableRowDataButton = document.createElement("button");

      tableRowDataButton.classList.add("send_button");
      tableRowDataButton.textContent = story.name;

      // Select story on click
      tableRowDataButton.addEventListener("click", () => {
        selectStory(index);
        hasEnded = false;
        resumeAudio();
      });

      // Play preview on hover
      tableRowDataButton.addEventListener("mouseover", () => {
        let audio = new Audio(story.audio_name);
        audio.play();
      });

      tableRowData.appendChild(tableRowDataButton);
      tableRow.appendChild(tableRowData);
      CONFIG.elements.storyChoiceTable.appendChild(tableRow);
    }
  }

  // Load a specific story into audio player + emotion schedule
  function selectStory(index) {
    let story = CONFIG.stories[index];
    emotionSchedule = story.emotions;
    for (let emotion of emotionSchedule) emotion.consumed = false;
    CONFIG.elements.audio.src = story.audio;
  }

  // ========================================================
  // INITIALIZATION
  // ========================================================

  // Handle end of playback
  CONFIG.elements.audio.addEventListener("ended", () => {
    keepMouthShut = true;
    hasEnded = true;
    console.log("Audio ended", emotionSchedule);
  });

  await downloadStories();
  selectStory(0); // auto-load first story
  startClock();

})();
