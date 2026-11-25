(() => {
  "use strict";

  const root = document.getElementById("soundsView");
  if (!root) return;

  const categories = { keys: "键盘", guitar: "吉他", bass: "贝斯", drums: "鼓组", ambient: "氛围" };
  const search = root.querySelector("#soundLibrarySearch");
  const count = root.querySelector("#soundLibraryCount");
  const list = root.querySelector("#soundSampleList");
  const empty = root.querySelector("#soundLibraryEmpty");
  const playbackStatus = root.querySelector("#soundPlaybackStatus");
  const reset = root.querySelector("#soundLibraryReset");
  const filters = [...root.querySelectorAll("[data-sound-filter]")];
  const audio = new Audio();
  audio.preload = "none";
  let category = "all";
  let activeButton;

  function stop() {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    if (activeButton) {
      activeButton.textContent = "试听";
      activeButton.setAttribute("aria-label", `试听 ${activeButton.dataset.name}`);
      activeButton = undefined;
    }
  }

  async function preview(button, path) {
    const alreadyPlaying = button === activeButton;
    stop();
    globalThis.MeldDx7Library?.stop();
    globalThis.MeldSourceInstruments?.stopPreview();
    playbackStatus.hidden = true;
    if (alreadyPlaying) return;
    activeButton = button;
    button.textContent = "停止";
    button.setAttribute("aria-label", `停止 ${button.dataset.name}`);
    audio.src = path;
    try {
      await audio.play();
    } catch {
      if (activeButton === button) {
        stop();
        playbackStatus.textContent = "试听载入失败。你可以下载文件后播放。";
        playbackStatus.hidden = false;
      }
    }
  }

  const rows = openSamples.map((sample) => {
    const path = `open-samples/${sample.file}`;
    const row = document.createElement("li");
    row.className = "sound-sample";
    row.dataset.category = sample.category;
    row.innerHTML = `
      <div class="sound-symbol" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="sound-sample-info">
        <h2>${sample.name}</h2>
        <p>${sample.detail} <span aria-hidden="true">·</span> ${sample.use}</p>
      </div>
      <div class="sound-attribution">
        <a href="${sample.url}" target="_blank" rel="noopener noreferrer">${sample.source}</a>
        <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" class="sound-license">CC0 1.0</a>
      </div>
      <div class="sound-actions">
        <button type="button" data-name="${sample.name}" aria-label="试听 ${sample.name}">试听</button>
        <button type="button" data-sample-use="studio">创作台</button>
        <button type="button" data-sample-use="lab">实验室</button>
        <button type="button" data-sample-use="arrangement">加音轨</button>
        <a href="${path}" download aria-label="下载 ${sample.name}">下载</a>
      </div>`;
    const button = row.querySelector("button");
    button.addEventListener("click", () => preview(button, path));
    for (const use of row.querySelectorAll("[data-sample-use]")) {
      use.addEventListener("click", () => useLibraryInstrument(sample.id, use.dataset.sampleUse));
    }
    list.append(row);
    return { row, category: sample.category, terms: [
      sample.name, sample.detail, sample.use, sample.source, sample.keywords, categories[sample.category], "cc0 1.0"
    ].join(" ").toLowerCase() };
  });

  function filterSamples() {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let total = 0;
    for (const sample of rows) {
      sample.row.hidden = (category !== "all" && category !== sample.category) ||
        !terms.every((term) => sample.terms.includes(term));
      if (!sample.row.hidden) total++;
      else if (activeButton && sample.row.contains(activeButton)) stop();
    }
    playbackStatus.hidden = true;
    count.textContent = `显示 ${total} / ${rows.length} 条采样`;
    empty.hidden = total !== 0;
    reset.hidden = category === "all" && search.value === "";
  }

  function selectCategory(nextCategory) {
    category = nextCategory;
    for (const item of filters) {
      item.setAttribute("aria-pressed", String(item.dataset.soundFilter === category));
    }
    filterSamples();
  }

  for (const filter of filters) {
    filter.addEventListener("click", () => selectCategory(filter.dataset.soundFilter));
  }
  reset.addEventListener("click", () => {
    search.value = "";
    selectCategory("all");
    search.focus();
  });
  search.addEventListener("input", filterSamples);
  audio.addEventListener("ended", stop);
  globalThis.MeldSoundLibrary = { stop };
  filterSamples();
})();
