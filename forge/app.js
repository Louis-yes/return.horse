// Magic Values
const PANELONEDESCRIPTION = "A cowboy riding left to right, smoking. The sun is up and there are birds in the sky";
const PANELTWODESCRIPTION =  "A cowboy riding right to left, smoking. The moon is up and there are stars in the sky";
const FULLDESCRIPTION = `Panel One: ${PANELONEDESCRIPTION}. Panel Two: ${PANELTWODESCRIPTION}`
const panelFull = document.querySelector("#panel-full");
const form = document.querySelector("form");
const savedComic = JSON.parse(localStorage.getItem('comic'))
const cowboy = new renderer("../clay");
const Comic = function(){
    return {
        title: "",
        date: "",
        hovertext: "",
        description: "",
        path: "",
        panelOneText: "",
        panelTwoText: "",
        panelOneAlt: "",
        panelTwoAlt:   "",
        fullAlt:       "",
    }
}
let data = []

document.querySelector("form").innerHTML = createForm()

if (savedComic) comicToForm(savedComic, form)

cowboy.yeehaw().then((render) => {
    update(render);
    fetch("../clay/comics.tsv").then(res => res.text()).then(d => { 
        data = tsvToComicArray(d)
        update(render)
    })
    form.addEventListener("input", e => update(render))
    form.addEventListener("submit", e => {
        e.preventDefault();
        downloadFiles(render)
    })
})

function downloadFiles(render){
    const cc = formToComic(form);
    const comicString = comicToString(cc);
    const images = render(cc)
    download('comic.txt', 'data:text/plain;charset=utf-8,' + encodeURIComponent(comicString));
    download("panelone.png", images[1])
    download("paneltwo.png", images[2])
    download("full.png", images[0])
}

function download(name, content){
    const element = document.createElement('a');
    element.setAttribute('href', content);
    element.setAttribute('download', name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function update(render){
    const cc = formToComic(form)
    panelFull.src = render(cc)[0]
    document.querySelector("#panelOneAlt").value = `${PANELONEDESCRIPTION}. Text reads: ${cc.panelOneText.replace(/\\\n/g, " ")}`; 
    document.querySelector("#panelTwoAlt").value = `${PANELTWODESCRIPTION}. Text reads: ${cc.panelTwoText.replace(/\\\n/g, " ")}`; 
    document.querySelector("#fullAlt").value = `Panel One: ${PANELONEDESCRIPTION}. Text reads - ${cc.panelOneText.replace(/\\\n/g, " ")}. Panel Two: ${PANELTWODESCRIPTION}. Text reads - ${cc.panelTwoText.replace(/\\\\n/g, " ")}`
    localStorage.setItem('comic', JSON.stringify(cc))
    if(!data.some(c => c.path == cc.path)){
        form.querySelector('button').disabled = false;        
    } else {
        form.querySelector('button').disabled = true;
    }
}

function formToComic(ff){
    const fd = new FormData(ff)
    const date = new Date().toISOString().substring(0,10)
    const values = [...fd.entries()].reduce((o,k) => {
        o[k[0]] = k[1].trim()
        return o
    }, new Comic())
    values.date = date
    return values
}

function comicToForm(cc, ff){
    Object.keys(new Comic()).forEach(n => {
        ff.querySelector(`[name=${n}]`).value = cc[n]
    })
}

function comicToString(comic){
return `date: ${comic.date}
title: ${comic.title}
path: ${comic.path}
description: ${comic.description}
hovertext: ${comic.hovertext}
panelOneText: ${comic.panelOneText.replace(/\s?\n/g, " \\\\n ")} 
panelTwoText: ${comic.panelTwoText.replace(/\s?\n/g, " \\\\n ")}
panelOneAlt: ${comic.panelOneAlt}
panelTwoAlt: ${comic.panelTwoAlt}
fullAlt: ${comic.fullAlt}
`
}

function createForm(){
    return `<ul>
        <li><label for="panelOneText">panel one</label> <textarea type="text" id="panelOneText" name="panelOneText"></textarea></li>
        <li><label for="panelTwoText">panel two</label><textarea type="text" id="panelTwoText" name="panelTwoText"></textarea></li>
        ${
            Object.keys(new Comic()).map(k => {
                return (k == "panelOneText" || k == "panelTwoText") ? "" :
                        `<li><label for="${k}}">${k}</label><input type="text" id="${k}" name="${k}"></li>`
            }).join('')
        }
        <li><button onclick="download">download</button></li>
        </ul>
    `
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    } 
}


function tsvToComicArray(tsv){
    return tsv.trim().split("\n").map(l => {
        const ll = l.split("\t")
        return {
            date:          ll[0],
            title:         ll[1],
            path:          ll[2],
            description:   ll[3],
            hovertext:     ll[4],
            panelOneText:  ll[5].replaceAll('\\n','\n') || "",
            panelTwoText:  ll[6].replaceAll('\\n','\n'),
            panelOneAlt:   ll[7],
            panelTwoAlt:   ll[8],
            fullAlt:       ll[9],
        }
    }).reverse()    
}