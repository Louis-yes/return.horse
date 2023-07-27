// Magic Values
const PANELONEX = 302;
const PANELTWOX = 782;
const PANELSY = 810;
const PANELONEDESCRIPTION = "A cowboy riding left to right, smoking. The sun is up and there are birds in the sky";
const PANELTWODESCRIPTION =  "A cowboy riding right to left, smoking. The moon is up and there are stars in the sky";
const FULLDESCRIPTION = `Panel One: ${PANELONEDESCRIPTION}. Panel Two: ${PANELTWODESCRIPTION}`
const TRANSFORMS = [
    { "x": 0, "y": 0, "font": "30px Helvetica" },
    { "x": 245, "y": -30, "font": "32px Helvetica" },
    { "x": -245, "y": -30, "font": "32px Helvetica" }
]
const IMAGES = [ image("full.png"), image("panel_1.png"), image("panel_2.png") ]
const AUTOY = (text) =>  825 - ((text.split('\n').length - 1) * 15);

const panelFull = document.querySelector("#panel-full");
const form = document.querySelector("form");
const output = document.querySelector("[name=output]")

let savedComic = JSON.parse(localStorage.getItem('comic'))
form.addEventListener("input", e => { update(); console.log('dd')})
if (savedComic) comicToForm(savedComic, form)
update();

function update(){
    const cc = formToComic(form)
    panelFull.src = getURLs(cc["text-panel-one"], cc["text-panel-two"])[0]
    document.querySelector("#alt-panel-one").value = `${PANELONEDESCRIPTION}. Text reads: ${cc["text-panel-one"].replace(/\n/g, " ")}`; 
    document.querySelector("#alt-panel-two").value = `${PANELTWODESCRIPTION}. Text reads: ${cc["text-panel-two"].replace(/\n/g, " ")}`; 
    document.querySelector("#alt-panel-full").value = `Panel One: ${PANELONEDESCRIPTION}. Text reads - ${cc["text-panel-one"].replace(/\n/g, " ")}. Panel Two: ${PANELTWODESCRIPTION}. Text reads - ${cc["text-panel-two"].replace(/\n/g, " ")}`
    localStorage.setItem('comic', JSON.stringify(cc))
    output.value = comicToString(cc);
}

function formToComic(ff){
    const fd = new FormData(ff)
    const date = new Date().toISOString().substring(0,10)
    const [URLPanelOne, URLPanelTwo, URLPanelFull] = getURLs(fd.get("text-panel-one"), fd.get("text-panel-two"))
    const values = [
        "title", "description", "path", "hovertext", 
        "text-panel-one", 
        "text-panel-two", 
        "alt-panel-one", 
        "alt-panel-two", 
        "alt-panel-full",
    ].reduce((o,k) => {
        o[k] = fd.get(k)
        return o
    }, {})

    return {...values, date, URLPanelOne, URLPanelTwo, URLPanelFull}
}

function comicToForm(cc, ff){
    [
        "title", "description", "path", "hovertext", 
        "text-panel-one", 
        "text-panel-two", 
        "alt-panel-one", 
        "alt-panel-two", 
        "alt-panel-full",
    ].forEach(n => {
        ff.querySelector(`[name=${n}]`).value = cc[n]
    })
}

function getURLs(textone, texttwo){
    const ccc = document.createElement('canvas');
    const ctx = ccc.getContext('2d');
    const r = 1080;
    let full = "";
    let one = "";
    let two = "";

    textone = textone || "";
    texttwo = texttwo || "";

    ccc.width = r;
    ccc.height = r;

    ctx.fillStyle = "#E51D2B";
    ctx.textAlign = "center";

    ctx.drawImage(IMAGES[0], 0, 0, r, r);
    ctx.font = TRANSFORMS[0].font;
    textone.split("\n").forEach((line,i) => { ctx.fillText(line, PANELONEX, autoY(textone) + i*30) });
    texttwo.split("\n").forEach((line,i) => { ctx.fillText(line, PANELTWOX, autoY(texttwo) + i*30) });
    full = ccc.toDataURL();

    ctx.drawImage(IMAGES[1], 0, 0, r, r);
    ctx.font = TRANSFORMS[1].font;
    textone.split("\n").forEach((line,i) => { 
        ctx.fillText(line, PANELONEX + TRANSFORMS[1].x, TRANSFORMS[1].y + autoY(textone) + i*32) });
    one = ccc.toDataURL();

    ctx.drawImage(IMAGES[2], 0, 0, r, r);
    ctx.font = TRANSFORMS[2].font;
    texttwo.split("\n").forEach((line,i) => { 
        ctx.fillText(line, PANELTWOX + TRANSFORMS[2].x, TRANSFORMS[2].y + autoY(texttwo) + i*32) });
    two = ccc.toDataURL();

    return([full, one, two])
}

function image(src){
    let img = new Image();
    img.src = src;
    return img
}

function comicToString(comic){
    return [
        "date: " + comic.date, 
        "title: " + comic.title, 
        "path: " + comic.path,
        "description: " +  comic.description,
        "hovertext: " + comic.hovertext, 
        "text-panel-one: " + comic["text-panel-one"], 
        "text-panel-two: " + comic["text-panel-two"], 
        "alt-panel-one: " + comic["alt-panel-one"], 
        "alt-panel-two: " + comic["alt-panel-two"], 
        "alt-panel-full: " + comic["alt-panel-full"]
    ].map(c => c.replace(/\s?\n/g, " \\n ")).join("\n")
}

function autoY(text){ return 825 - ((text.split('\n').length - 1) * 15); }
function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    } 
}