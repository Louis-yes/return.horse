// comic class
class Comic {
  constructor({
    title,
    date,
    hovertext,
    description,
    path,
    panelOneText,
    panelTwoText,
    panelOneAlt,
    panelTwoAlt,
    fullAlt,
  } = {}) {
    this.title = title || "";
    this.date = date || "";
    this.hovertext = hovertext || "";
    this.description = description || "";
    this.path = path || "";
    this.panelOneText = panelOneText || "";
    this.panelTwoText = panelTwoText || "";
    this.panelOneAlt = panelOneAlt || "";
    this.panelTwoAlt = panelTwoAlt || "";
    this.fullAlt = fullAlt || "";
  }
}

init();
function init() {
  const form = Form(document.querySelector("#form"));
  const drafts = Drafts(document.querySelector("#drafts"));
  const renderer = ComicRenderer(document.querySelector("#panel-full"));
  form.on(form.events.input, (comic) => {
    drafts.put(comic);
    renderer.render(comic);
  });
  drafts.on(drafts.events.select, (comic) => {
    form.put(comic);
    renderer.render(comic);
  });
  form.on(form.events.download, (comic) => {
    renderer.downloadFiles();
  });
  drafts.ping();
}

function Drafts(el) {
  const ls = localStorage.getItem("comics");
  const dbDrafts = ls ? JSON.parse(ls) : [];
  const eb = eventBus();
  const events = { select: "select" };

  const draftList = document.createElement("ul");
  const newDraft = document.createElement("button");
  const removeDraft = document.createElement("button");

  let selectedIndex = localStorage.getItem("selectedIndex") || 0;

  draftList.id = "draft-list";
  newDraft.id = "new-draft";
  removeDraft.id = "remove-draft";

  newDraft.innerText = "new";
  removeDraft.innerText = "remove";

  newDraft.addEventListener("click", post);
  removeDraft.addEventListener("click", remove);
  draftList.addEventListener("change", () =>
    select(draftList.querySelector(":checked").value)
  );

  renderDrafts();
  eb.emit(events.select, dbDrafts[selectedIndex]);

  el.appendChild(draftList);
  el.appendChild(newDraft);
  el.appendChild(removeDraft);

  function put(comic) {
    updateDraft(selectedIndex, comic);
    save();
    renderDrafts();
  }
  function select(index) {
    selectedIndex = index;
    localStorage.setItem("selectedIndex", index);
    renderDrafts();
    eb.emit(events.select, dbDrafts[selectedIndex]);
  }
  function save() {
    localStorage.setItem("comics", JSON.stringify(dbDrafts));
  }
  function updateDraft(index, draft) {
    dbDrafts[index] = draft;
  }
  function post() {
    dbDrafts.push(new Comic());
    save();
    select(dbDrafts.length - 1);
  }
  function remove() {
    dbDrafts.splice(selectedIndex, 1);
    save();
    select(
      selectedIndex > dbDrafts.length - 1 ? dbDrafts.length - 1 : selectedIndex
    );
  }
  function renderDrafts() {
    draftList.innerHTML = `
            ${
              dbDrafts.length
                ? `${dbDrafts
                    .map(
                      (
                        d,
                        i
                      ) => `<li><input id="draft-${i}" type="radio" name="draft" value="${i}" ${
                        i == selectedIndex ? "checked" : ""
                      }><label for="draft-${i}">${
                        d.title || d.panelOneText || "untitled"
                      }</label></li>
            `
                    )
                    .join("")}`
                : `<p> no drafts yet </p>`
            }
        `;
  }
  function ping() {
    eb.emit(events.select, dbDrafts[selectedIndex]);
  }
  return {
    put,
    events,
    ping,
    on: (ee, cc) => eb.on(ee, cc),
  };
}

function Form(el) {
  const PANELONEDESCRIPTION =
    "A cowboy riding left to right, smoking. The sun is up and there are birds in the sky";
  const PANELTWODESCRIPTION =
    "A cowboy riding right to left, smoking. The moon is up and there are stars in the sky";

  const eb = eventBus();
  const events = { input: "input", download: "download" };

  const publish = el.querySelector("#publish");
  const clearForm = el.querySelector("#clear-form");

  let publishedComics = [];

  renderForm();
  fetch("../clay/comics.tsv")
    .then((res) => res.text())
    .then((d) => (publishedComics = tsvToComicArray(d)));

  el.addEventListener("input", () => {
    enrichForm();
    eb.emit(events.input, formToComic(el));
  });

  clearForm.addEventListener("click", (e) => {
    e.preventDefault();
    comicToForm(new Comic(), el);
    enrichForm();
  });

  publish.addEventListener("click", (e) => {
    e.preventDefault();
    downloadFiles();
    eb.emit(events.download, formToComic(el));
  });

  function put(comic) {
    comicToForm(comic, el);
    enrichForm();
  }

  function enrichForm() {
    const cc = formToComic(el);
    const formattedText = [
      cc.panelOneText.replace(/\n/g, " "),
      cc.panelTwoText.replace(/\n/g, " "),
    ];
    const validPath =
      publishedComics.length &&
      !publishedComics.some((c) => c.path == cc.path) &&
      !!cc.path;
    document.querySelector(
      "#panelOneAlt"
    ).value = `${PANELONEDESCRIPTION}. Text reads: ${formattedText[0]}`;
    document.querySelector(
      "#panelTwoAlt"
    ).value = `${PANELTWODESCRIPTION}. Text reads: ${formattedText[1]}`;
    document.querySelector("#fullAlt").value =
      `Panel One: ${PANELONEDESCRIPTION}. Text reads - ${formattedText[0]}. ` +
      `Panel Two: ${PANELTWODESCRIPTION}. Text reads - ${formattedText[1]}`;
    el.classList.toggle("unoriginal-path", !validPath);
  }

  function comicToForm(cc, ff) {
    Object.keys(new Comic()).forEach((n) => {
      if (n != "date") ff.querySelector(`[name=${n}]`).value = cc[n];
    });
  }

  function formToComic(ff) {
    const fd = new FormData(ff);
    const date = new Date().toISOString().substring(0, 10);
    const values = [...fd.entries()].reduce((o, k) => {
      o[k[0]] = k[1].trim();
      return o;
    }, new Comic());
    values.date = date;
    return values;
  }

  function renderForm() {
    el.querySelector("fieldset").innerHTML = `<ul>
            <li><label for="panelOneText">panel one</label> <textarea type="text" id="panelOneText" name="panelOneText"></textarea></li>
            <li><label for="panelTwoText">panel two</label><textarea type="text" id="panelTwoText" name="panelTwoText"></textarea></li>
            ${Object.keys(new Comic())
              .map((k) => {
                return k == "panelOneText" || k == "panelTwoText" || k == "date"
                  ? ""
                  : `<li><label for="${k}">${k}</label><input type="text" id="${k}" name="${k}"></li>`;
              })
              .join("")}
        </ul>
        `;
  }

  function tsvToComicArray(tsv) {
    return tsv
      .trim()
      .split("\n")
      .map((l) => {
        const ll = l.split("\t");
        return new Comic({
          date: ll[0],
          title: ll[1],
          path: ll[2],
          description: ll[3],
          hovertext: ll[4],
          panelOneText: ll[5].replaceAll("\\n", "\n") || "",
          panelTwoText: ll[6].replaceAll("\\n", "\n"),
          panelOneAlt: ll[7],
          panelTwoAlt: ll[8],
          fullAlt: ll[9],
        });
      })
      .reverse();
  }

  function downloadFiles(render) {
    const cc = formToComic(form);
    const comicString = comicToString(cc);
    download(
      "comic.txt",
      "data:text/plain;charset=utf-8," + encodeURIComponent(comicString)
    );
  }

  function comicToString(comic) {
    return `date: ${comic.date}
title: ${comic.title}
path: ${comic.path}
description: ${comic.description}
hovertext: ${comic.hovertext}
panelOneText: ${comic.panelOneText.replace(/\s?\n/g, " \\\\n ")} 
panelTwoText: ${comic.panelTwoText.replace(/\s?\n/g, " \\\\n ")}
panelOneAlt: ${comic.panelOneAlt}
panelTwoAlt: ${comic.panelTwoAlt}
fullAlt: ${comic.fullAlt}`;
  }

  return {
    put,
    events,
    on: (ee, cc) => eb.on(ee, cc),
  };
}

function ComicRenderer(el) {
  const eb = new eventBus();
  const cowboy = new renderer("../clay");
  let imgs = [];

  let comic = new Comic();

  cowboy.yeehaw().then((render) => {
    eb.on("render", (comic) => {
      imgs = render(comic);
      el.src = imgs[0];
      eb.emit("image-rendered", imgs);
    });
    eb.emit("render", comic);
  });

  function render(cc) {
    comic = cc;
    eb.emit("render", comic);
  }

  function downloadFiles(render) {
    download("panelone.png", imgs[1]);
    download("paneltwo.png", imgs[2]);
    download("full.png", imgs[0]);
  }

  return {
    render,
    downloadFiles,
    on: (ee, cc) => eb.on(ee, cc),
  };
}

function eventBus() {
  return (eb = {
    subscribers: {},
    emit: function (ee, data) {
      this.subscribers[ee]
        ? this.subscribers[ee].forEach((cb) => cb(data))
        : "";
    },
    on: function (ee, cb) {
      if (!this.subscribers[ee]) {
        this.subscribers[ee] = [];
      }
      this.subscribers[ee].push(cb);
    },
  });
}

function download(name, content) {
  const element = document.createElement("a");
  element.setAttribute("href", content);
  element.setAttribute("download", name);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
