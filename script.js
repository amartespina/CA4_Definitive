let canvas = null
let ctx = null

let offscreenCanvas = null
let offscreenCanvasCtx = null

let img_00 = new Image()
img_00.src = "images/spiderman.jpeg"
let img_01 = new Image()
img_01.src = "images/hulk.jpg"

let brightnessLevelRed = 0
let brightnessLevelGreen = 0
let brightnessLevelBlue = 0

let images = [
    {src: img_00, x: 100, y: 100, width: 150, height: 150, rotation: 0, brightness: 0, greyscale: false},
    {src: img_01, x: 300, y: 300, width: 150, height: 150, rotation: 0, brightness: 0, greyscale: false}]

let currentImageIndex = 0

window.onload = onAllAssetsLoaded
document.write("<div id='loadingMessage'>Loading...</div>")
function onAllAssetsLoaded()
{
    document.getElementById("loadingMessage").style.visibility = "hidden"
    
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    
    //offscreen canvas (I can use it for layers, like in Photoshop)
    offscreenCanvas = document.createElement("canvas")
    offscreenCanvasCtx = offscreenCanvas.getContext("2d")
    offscreenCanvas.width = canvas.clientWidth
    offscreenCanvas.height = canvas.clientHeight
                    
    //draw
    renderCanvas()
    
    window.onmousewheel = document.onmousewheel = mouseWheelHandler
    canvas.addEventListener('mousedown', mousedownHandler)
    canvas.addEventListener('mousemove', moveHandler)
}
function renderCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    images.map((image, index) => {
        offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        
        if (index == currentImageIndex)
        {
            offscreenCanvasCtx.fillStyle = "yellow"
            offscreenCanvasCtx.fillRect(image.x - 2, image.y - 2, image.width + 4, image.height + 4)
        }
        offscreenCanvasCtx.drawImage(image.src, image.x, image.y, image.width, image.height)
        imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)
    
        for (let i = 0; i < imageData.data.length; i += 4)
        {
            imageData.data[i + 0] = imageData.data[i + 0] + image.brightness + brightnessLevelRed
            imageData.data[i + 1] = imageData.data[i + 1] + image.brightness + brightnessLevelGreen
            imageData.data[i + 2] = imageData.data[i + 2] + image.brightness + brightnessLevelBlue
            imageData.data[i + 3] = 255
        }
        
        offscreenCanvasCtx.putImageData(imageData, image.x, image.y)
    
        if (image.greyscale)
        {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)
            for (let i = 0; i < imageData.data.length; i += 4)
            {
                thisgreyscale = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
                imageData.data[i + 0] = thisgreyscale
                imageData.data[i + 1] = thisgreyscale
                imageData.data[i + 2] = thisgreyscale
                imageData.data[i + 3] = 255
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)
        }

        
        
        ctx.save()
        ctx.translate((image.x + image.width / 2), (image.y + image.height / 2))
        ctx.rotate(Math.radians(image.rotation))
        ctx.translate(-(image.x + image.width / 2), -(image.y + image.height / 2))
        
        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height)
        ctx.restore()
    })
}

function updateBrightnessLevel()
{
    brightnessLevelRed = parseInt(document.getElementById("brightnessRed").value)
    brightnessLevelGreen = parseInt(document.getElementById("brightnessGreen").value)
    brightnessLevelBlue = parseInt(document.getElementById("brightnessBlue").value)
    renderCanvas()
}

function mouseWheelHandler(e)
{
    if (currentImageIndex !== null)
    {
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        let mouseX = e.clientX - canvasBoundingRectangle.left
        let mouseY = e.clientY - canvasBoundingRectangle.top

        if (mouseIsInsideImage(images[currentImageIndex].x, images[currentImageIndex].y, images[currentImageIndex].width, images[currentImageIndex].height, mouseX, mouseY))
        {
            images[currentImageIndex].width += e.wheelDelta / 120
            images[currentImageIndex].height += e.wheelDelta / 120

            images[currentImageIndex].x = images[currentImageIndex].x - (e.wheelDelta / 120) / 2
            images[currentImageIndex].y = images[currentImageIndex].y - (e.wheelDelta / 120) / 2
                
            //redraw all the images
            renderCanvas()
        }
    }
}
function mousedownHandler(e)
{
    // check if the left button is being pressed
    if (e.which === 1)
    {
        //figure out where the mouse is in relation to the canvas 
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top
        
        currentImageIndex = null
        for (let i = images.length - 1; i > -1; i--)
        {
            // get the offset of the image ( where I'm clicking on the image, i.e. x and y )
            if (mouseIsInsideImage(images[i].x, images[i].y, images[i].width, images[i].height, mouseX, mouseY))
            {
                offsetX = mouseX - images[i].x
                offsetY = mouseY - images[i].y
                currentImageIndex = i
                renderCanvas()
                break
            }
        }
    }
}

function moveHandler(e){
    if (currentImageIndex !== null && e.which === 1){ //left mouse button

        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top
        
        images[currentImageIndex].x = mouseX - offsetX
        images[currentImageIndex].y = mouseY - offsetY
        renderCanvas()
    }
}
function mouseIsInsideImage(imageTopLeftX, imageTopLeftY, imageWidth, imageHeight, x, y){
    if ((x > imageTopLeftX) && (y > imageTopLeftY)) {
        if (x > imageTopLeftX){
            if ((x - imageTopLeftX) > imageWidth)
            {
                return false
            }
        }

        if (y > imageTopLeftY){
            if ((y - imageTopLeftY) > imageHeight){
                return false
            }
        }
    }
    else{
        return false
    }
    return true
}


function setRotationDegrees(newRotationDegrees){
    images[currentImageIndex].rotation = parseInt(newRotationDegrees)
    renderCanvas()
}

function setBrightness(newBrightness){
    images[currentImageIndex].brightness = parseInt(newBrightness)
    renderCanvas()
}

function toggleGreyscale(greyscaleIsSet){
    images[currentImageIndex].greyscale = greyscaleIsSet
    renderCanvas()                
}

Math.radians = function (degrees){
    return degrees * Math.PI / 180
}