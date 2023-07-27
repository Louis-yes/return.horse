// renderer.render().then(imgs)
function renderer(path){
    const IMAGES = [
        path+"/full.png", 
        path+"/panel_1.png", 
        path+"/panel_2.png"
    ]

    function yeehaw(){
        return new Promise((resolve, reject) => {
            const loadState = [false,false,false]
            const images = IMAGES.map((ii,i) => {
                const img = document.createElement("img");
                img.onload = () => onload(i);
                img.src = ii;
                return img;
            })

            function onload(i){
                loadState[i] = 1;
                if(loadState.every(ii => ii)) resolve(render)
            }

            function render(comic){ return getURLs(comic, images) }
        
        })
    }

    function getURLs(comic, images){
        const textone = comic.panelOneText;
        const texttwo = comic.panelTwoText;
        const ccc = document.createElement('canvas');
        const ctx = ccc.getContext('2d');
        const r = 1080;
        const TRANSFORMS = [
            { "x": 0, "y": 0, "font": "30px Helvetica" },
            { "x": 245, "y": -30, "font": "32px Helvetica" },
            { "x": -245, "y": -30, "font": "32px Helvetica" }
        ]
        const PANELONEX = 302;
        const PANELTWOX = 782;
        const PANELSY = 810;
    
        let full = "";
        let one = "";
        let two = "";
        function autoY(text){ return 825 - ((text.split('\n').length - 1) * 15); }
    
        ccc.width = r;
        ccc.height = r;
    
        ctx.fillStyle = "#E51D2B";
        ctx.textAlign = "center";

        ctx.drawImage(images[0], 0, 0, r, r);
        ctx.font = TRANSFORMS[0].font;
        textone.split("\n").forEach((line,i) => { ctx.fillText(line.trim(), PANELONEX, autoY(textone) + i*30) });
        texttwo.split("\n").forEach((line,i) => { ctx.fillText(line.trim(), PANELTWOX, autoY(texttwo) + i*30) });
        full = ccc.toDataURL();

        ctx.drawImage(images[1], 0, 0, r, r);
        ctx.font = TRANSFORMS[1].font;
        textone.split("\n").forEach((line,i) => { 
            ctx.fillText(line.trim(), PANELONEX + TRANSFORMS[1].x, TRANSFORMS[1].y + autoY(textone) + i*32) });
        one = ccc.toDataURL();
    
        ctx.drawImage(images[2], 0, 0, r, r);
        ctx.font = TRANSFORMS[2].font;
        texttwo.split("\n").forEach((line,i) => { 
            ctx.fillText(line.trim(), PANELTWOX + TRANSFORMS[2].x, TRANSFORMS[2].y + autoY(texttwo) + i*32) });
        two = ccc.toDataURL();
        return([full, one, two])
    }

    return { yeehaw }
}
