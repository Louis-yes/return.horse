console.log(`
Welcome to return.horse - console view

This website loads with a Tab Separated Value file injected into a 'data' tag.

After that is a script tag, which loads in a script that takes that file and
turns it into an array of 'comic' entries. 

It then loops through these entries and creates an html list which it inserts 
into the page. 

Each list entry contains the comic date, the title, the description (hidden 
behind a '+' symbol), an anchor to link to and most importantly one (for 
desktop) or two (for mobile) empty image elements. 

After this list is created the script calls a function that loads the base 
images into the browser, then loops through and generates the images 
for each comic.

`)

const cowboy = new renderer("clay")
const comicList = document.getElementById('comic-list')
const stage = document.getElementById("stage")
const stagetwo = document.getElementById("stage-two")
const data = tsvToComicArray();
const dataHash = data.reduce((pv, cv) => { return {...pv, [cv.date]: cv} }, {})

console.log("✍️ ~ creating html list from array")
comicList.innerHTML = data.map((cc,i) => makeComic(cc, data.length - i)).join("")

cowboy.yeehaw().then(render => {
    const list = comicList.querySelectorAll('li[data-date]');
    console.log("📷 ~ generating images")
    oneByOne(0, list, (li) => {
        const comic = dataHash[li.dataset.date];
        console.log(`📸 ${comic.date} ~ ${comic.title}`)
        const imgs = render(comic);
        li.querySelector('.panel-full').src = imgs[0];
        li.querySelector('.panel-one').src = imgs[1];
        li.querySelector('.panel-two').src = imgs[2];
    })
});

document.addEventListener('click', (e) => {
    if(e.target.classList.contains('description')) e.target.classList.toggle('reveal');
    if(e.target.classList.contains('description-text')) toggleDescription(e.target);
    if(e.target.classList.contains('toggle')) toggleDescription(e.target);
    if(e.target.tagName == "MENU") toggleMenu();
})

function toggleDescription(el){
    const description = el.closest('.description');
    const res = description.classList.toggle('reveal');
    const toggle = description.querySelector('.toggle');
    toggle.innerText = res ? "−" : "+" ;
}

function toggleMenu() {
    const isOpen = document.querySelector('nav').classList.toggle('open');
    document.querySelector('main').classList.toggle('blur');
    document.querySelector('menu').innerText = isOpen ? "close" : "?";
}

function oneByOne(i, list, ff){
    if(!list[i]) return;
    ff(list[i])
    requestAnimationFrame( () => oneByOne(i+1, list, ff) )
}

function makeComic(cc, i){
    return `
    <li data-date="${cc.date}" class="day">
        <time datetime="${cc.date}">day ${i}</time>
        <ul class="mobile-panels">
            <li><img class="panel-one" width="600" height="600" alt="${cc.panelOneAlt}"></li>
            <li><img class="panel-two" width="600" height="600" alt="${cc.panelTwoAlt}"></li>
        </ul>
        <img class="panel-full" width="600" height="600" title="${cc.hovertext}">
        <article>
            <h2 id="${cc.path}">${cc.title}</h2>
            <p class="description"><span class="toggle">+</span> <span class="description-text">${cc.description}</span></p>
        </article>
    </li>`
}

function tsvToComicArray(){
    console.log(`⌗ ~ making array from TSV file`)
    return document.querySelector("#comics").innerHTML.trim().split("\n").map(l => {
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