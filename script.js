let canvas = null
let ctx = null

let img = new Image()
img.src = "images/cool.jpeg"

let brightnessLevelRed = 0
let brightnessLevelGreen = 0
let brightnessLevelBlue = 0


window.onload = onAllAssetsLoaded
document.write("<div id='loadingMessage'>Loading...</div>")
function onAllAssetsLoaded()
{
    // hide the webpage loading message
    document.getElementById('loadingMessage').style.visibility = "hidden"

    canvas = document.getElementById("theCanvas")
    ctx = canvas.getContext("2d")
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    renderCanvas()
}


let imageData = null
function renderCanvas()
{
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < imageData.data.length; i += 4)
    {
        imageData.data[i + 0] = imageData.data[i + 0] + brightnesLevelRed
        imageData.data[i + 1] = imageData.data[i + 1] + brightnesLevelGreen
        imageData.data[i + 2] = imageData.data[i + 2] + brightnesLevelBlue
        imageData.data[i + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)
}

function updateBrightnesLevel()
{
    brightnesLevelRed = parseInt(document.getElementById("brightnesRed").value)
    brightnesLevelGreen = parseInt(document.getElementById("brightnesGreen").value)
    brightnesLevelBlue = parseInt(document.getElementById("brightnesBlue").value)
    renderCanvas()
}