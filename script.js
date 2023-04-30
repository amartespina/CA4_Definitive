let canvas = null
let ctx = null

let offscreenCanvas = null
let offscreenCanvasCtx = null

let img_00 = new Image()
img_00.src = "images/spiderman.jpeg"
let img_01 = new Image()
img_01.src = "images/hulk.jpg"



let paint = false 
let radius = 10



// Image Convolutions 
let embossConvolutionMatrix = [0, 0, 0,
    0, 2, -1,
    0, -1, 0]

let blurConvolutionMatrix = [1, 2, 1,
    2, 4, 2,
    1, 2, 1]

let sharpenConvolutionMatrix = [0, -2, 0,
    -2, 11, -2,
    0, -2, 0]

let edgeDetectionConvolutionMatrix = [1, 1, 1,
    1, -7, 1,
    1, 1, 1]

let noConvolutionMatrix = [0, 0, 0,
    0, 1, 0,
    0, 0, 0]


    let doubleBuffer = null
    let doubleBufferG = null
    let imageData = null
    let data = null
    let originalImageData = null
    let originalData = null
    let convolvedPixel = null
    let convolutionMatrix = null





let images = [
    {src: img_00, x: 100, y: 100, width: 150, height: 150, rotation: 0, brightness: 0, brightnessLevelRed: 0, brightnessLevelGreen: 0, brightnessLevelBlue: 0,  greyscale: false, invert: false, emboss: false, blur:false, sharpen:false , sepia: false},
    {src: img_01, x: 300, y: 300, width: 150, height: 150, rotation: 0, brightness: 0, brightnessLevelRed: 0, brightnessLevelGreen: 0, brightnessLevelBlue: 0, greyscale: false, invert: false, emboss: false, blur:false, sharpen:false, sepia:false}]

let currentImageIndex = 0


window.onload = onAllAssetsLoaded
document.write("<div id='loadingMessage'>Loading...</div>")
function onAllAssetsLoaded(){
    document.getElementById("loadingMessage").style.visibility = "hidden"
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Convolutions
    doubleBuffer = document.createElement('canvas')
    doubleBufferG = doubleBuffer.getContext('2d')
    doubleBuffer.width = canvas.clientWidth
    doubleBuffer.height = canvas.clientHeight

    offscreenCanvas = document.createElement("canvas")
    offscreenCanvasCtx = offscreenCanvas.getContext("2d")
    offscreenCanvas.width = canvas.clientWidth
    offscreenCanvas.height = canvas.clientHeight
                    
    window.onmousewheel = document.onmousewheel = mouseWheelHandler
    canvas.addEventListener('mousedown', mousedownHandler)
    canvas.addEventListener('mousemove', moveHandler)
    canvas.addEventListener('mousemove', mousemoveHandler)

    renderCanvas()
}


function renderCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    images.map((image, index) => {
        offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        
        if (index == currentImageIndex)        {
            offscreenCanvasCtx.fillStyle = "white"
            offscreenCanvasCtx.fillRect(image.x - 2, image.y - 2, image.width + 4, image.height + 4)
        }

        offscreenCanvasCtx.drawImage(image.src, image.x, image.y, image.width, image.height)
        imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)
    
        for (let i = 0; i < imageData.data.length; i += 4){

            imageData.data[i + 0] = imageData.data[i + 0] + image.brightness + image.brightnessLevelRed
            imageData.data[i + 1] = imageData.data[i + 1] + image.brightness + image.brightnessLevelGreen
            imageData.data[i + 2] = imageData.data[i + 2] + image.brightness + image.brightnessLevelBlue
            imageData.data[i + 3] = 255
        }

        offscreenCanvasCtx.putImageData(imageData, image.x, image.y)
    
        if (image.greyscale) {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)
            for (let i = 0; i < imageData.data.length; i += 4){
                thisgreyscale = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
                imageData.data[i + 0] = thisgreyscale
                imageData.data[i + 1] = thisgreyscale
                imageData.data[i + 2] = thisgreyscale
                imageData.data[i + 3] = 255
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)
        }


        if (image.invert){
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)
            for (let i = 0; i < imageData.data.length; i += 4){
                thisgreyscale = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
                imageData.data[i + 0] = 255 - imageData.data[i + 0]
                imageData.data[i + 1] = 255 - imageData.data[i + 0]
                imageData.data[i + 2] = 255 - imageData.data[i + 0]
                imageData.data[i + 3] = 255
                offscreenCanvasCtx.putImageData(imageData, image.x, image.y)
             }
            
        }
        if (image.sepia){
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)
            for (let i = 0; i < imageData.data.length; i += 4){
                red = imageData.data[i]
                green = imageData.data[i + 1]
                blue = imageData.data[i + 2]

                imageData.data[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189)
                imageData.data[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168)
                imageData.data[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131)
            }
            
            offscreenCanvasCtx.putImageData(imageData, image.x , image.y)
        }


        if (image.emboss){
            convolutionMatrix = embossConvolutionMatrix
            imageToConvolve = images[currentImageIndex]
            console.log("emboss.image")
            width = imageToConvolve.width
            height = imageToConvolve.height
            doubleBufferG.drawImage(imageToConvolve.src,imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            imageData = doubleBufferG.getImageData(imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            data = imageData.data
            convolutionAmount = 0
            for (let j = 0; j < 9; j++){
                convolutionAmount += convolutionMatrix[j]
            }
            originalImageData = doubleBufferG.getImageData(imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            originalData = originalImageData.data
                            for (let i = 0; i < data.length; i += 4){
                                data[ i + 3] = 255 
                                for (let rgbOffset = 0; rgbOffset < 3; rgbOffset++){
                                    let convolutionPixels = [originalData[i + rgbOffset - width * 4 - 4],
                                        originalData[i + rgbOffset - width * 4],
                                        originalData[i + rgbOffset - width * 4 + 4],
                                        originalData[i + rgbOffset - 4],
                                        originalData[i + rgbOffset],
                                        originalData[i + rgbOffset + 4],
                                        originalData[i + rgbOffset + width * 4 - 4],
                                        originalData[i + rgbOffset + width * 4],
                                        originalData[i + rgbOffset + width * 4 + 4]]
                                    convolvedPixel = 0
                                    for (let j = 0; j < 9; j++){
                                        convolvedPixel += convolutionPixels[j] * convolutionMatrix[j]
                                    }
        		 
                                    if (convolutionMatrix === embossConvolutionMatrix){
                                        data[i + rgbOffset] = convolvedPixel + 127
                                    }
                                    else{
                                        convolvedPixel /= convolutionAmount
                                        data[i + rgbOffset] = convolvedPixel
                                    }
                                }
                            }
     
                            offscreenCanvasCtx.putImageData(imageData,imageToConvolve.x,imageToConvolve.y )
        }

        if (image.blur){
            convolutionMatrix = blurConvolutionMatrix
            imageToConvolve = images[currentImageIndex]
            width = imageToConvolve.width
            height = imageToConvolve.height
            doubleBufferG.drawImage(imageToConvolve.src,imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            imageData = doubleBufferG.getImageData(imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            data = imageData.data
            convolutionAmount = 0
            for (let j = 0; j < 9; j++){
                convolutionAmount += convolutionMatrix[j]
            }
            originalImageData = doubleBufferG.getImageData(imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            originalData = originalImageData.data
            for (let i = 0; i < data.length; i += 4){
                data[ i + 3] = 255 
                for (let rgbOffset = 0; rgbOffset < 3; rgbOffset++){
                    let convolutionPixels = [originalData[i + rgbOffset - width * 4 - 4],
                    originalData[i + rgbOffset - width * 4],
                    originalData[i + rgbOffset - width * 4 + 4],
                    originalData[i + rgbOffset - 4],
                    originalData[i + rgbOffset],
                    originalData[i + rgbOffset + 4],
                    originalData[i + rgbOffset + width * 4 - 4],
                    originalData[i + rgbOffset + width * 4],
                    originalData[i + rgbOffset + width * 4 + 4]]
                    convolvedPixel = 0
                    for (let j = 0; j < 9; j++){
                        convolvedPixel += convolutionPixels[j] * convolutionMatrix[j]
                    }
        		 
                    if (convolutionMatrix === blurConvolutionMatrix){
                        data[i + rgbOffset] = convolvedPixel + 127
                    }
                    else{
                        convolvedPixel /= convolutionAmount
                        data[i + rgbOffset] = convolvedPixel
                        }
                }
            }
            offscreenCanvasCtx.putImageData(imageData,imageToConvolve.x,imageToConvolve.y )
        }

        if (image.sharpen){
            convolutionMatrix = sharpenConvolutionMatrix
            imageToConvolve = images[currentImageIndex]
            width = imageToConvolve.width
            height = imageToConvolve.height
            doubleBufferG.drawImage(imageToConvolve.src,imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            imageData = doubleBufferG.getImageData(imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            data = imageData.data
            convolutionAmount = 0
            for (let j = 0; j < 9; j++){
                convolutionAmount += convolutionMatrix[j]
            }
            originalImageData = doubleBufferG.getImageData(imageToConvolve.x,imageToConvolve.y, imageToConvolve.width, imageToConvolve.height)
            originalData = originalImageData.data
                            for (let i = 0; i < data.length; i += 4){
                                data[ i + 3] = 255 
                                for (let rgbOffset = 0; rgbOffset < 3; rgbOffset++){
                                    let convolutionPixels = [originalData[i + rgbOffset - width * 4 - 4],
                                        originalData[i + rgbOffset - width * 4],
                                        originalData[i + rgbOffset - width * 4 + 4],
                                        originalData[i + rgbOffset - 4],
                                        originalData[i + rgbOffset],
                                        originalData[i + rgbOffset + 4],
                                        originalData[i + rgbOffset + width * 4 - 4],
                                        originalData[i + rgbOffset + width * 4],
                                        originalData[i + rgbOffset + width * 4 + 4]]
                                    convolvedPixel = 0
                                    for (let j = 0; j < 9; j++){
                                        convolvedPixel += convolutionPixels[j] * convolutionMatrix[j]
                                    }
        		 
                                    if (convolutionMatrix === sharpenConvolutionMatrix){
                                        data[i + rgbOffset] = convolvedPixel + 127
                                    }
                                    else{
                                        convolvedPixel /= convolutionAmount
                                        data[i + rgbOffset] = convolvedPixel
                                    }
                                }
                            }
             offscreenCanvasCtx.putImageData(imageData,imageToConvolve.x,imageToConvolve.y )
        }

        ctx.save()
        ctx.translate((image.x + image.width / 2), (image.y + image.height / 2))
        ctx.rotate(Math.radians(image.rotation))
        ctx.translate(-(image.x + image.width / 2), -(image.y + image.height / 2))
        
        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height)
        ctx.restore()
    })
}

function color(newColor){
    console.log(newColor)
    ctx.fillStyle = newColor
}

function toWrite(text){   
    let textX = document.getElementById("positionx").value
    let textY = document.getElementById("positiony").value
    ctx.fillStyle = document.getElementById("colourPickerText")
    ctx.font = "100px Times Roman" 
   let texto =  ctx.fillText(text, textX, textY) // poner las variables 
}

function mousemoveHandler(e){
    if(paint){
        ctx.fillStyle=document.getElementById("colourPicker").value

        if (e.which === 1){
            let canvasBoundingRectangle = canvas.getBoundingClientRect()
            mouseX = e.clientX - canvasBoundingRectangle.left
            mouseY = e.clientY - canvasBoundingRectangle.top
            ctx.beginPath()
            ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.closePath()
        }
    }
}




// Mouse Controls 
function mouseWheelHandler(e){
    if (currentImageIndex !== null){
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        let mouseX = e.clientX - canvasBoundingRectangle.left
        let mouseY = e.clientY - canvasBoundingRectangle.top

        if (mouseIsInsideImage(images[currentImageIndex].x, images[currentImageIndex].y, images[currentImageIndex].width, images[currentImageIndex].height, mouseX, mouseY)){
            images[currentImageIndex].width += e.wheelDelta / 120
            images[currentImageIndex].height += e.wheelDelta / 120

            images[currentImageIndex].x = images[currentImageIndex].x - (e.wheelDelta / 120) / 2
            images[currentImageIndex].y = images[currentImageIndex].y - (e.wheelDelta / 120) / 2
                
            //redraw all the images
            renderCanvas()
        }
    }
}
function mousedownHandler(e){
    if (e.which === 1){
        //figure out where the mouse is in relation to the canvas 
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top

        currentImageIndex = null
        for (let i = images.length - 1; i > -1; i--){
            // get the offset of the image ( where I'm clicking on the image, i.e. x and y )
            if (mouseIsInsideImage(images[i].x, images[i].y, images[i].width, images[i].height, mouseX, mouseY)){
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
    if (currentImageIndex !== null && e.which === 1){ 
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







// RGB 
function setBrightnessRed(newBrightnessLevelRed){
    images[currentImageIndex].brightnessLevelRed = parseInt(newBrightnessLevelRed)
    renderCanvas()
}
function setBrightnessBlue(newBrightnessLevelBlue){
    images[currentImageIndex].brightnessLevelBlue = parseInt(newBrightnessLevelBlue)
    renderCanvas()
}
function setBrightnessGreen(newBrightnessLevelGreen){
    images[currentImageIndex].brightnessLevelGreen = parseInt(newBrightnessLevelGreen)
    renderCanvas()
}


// Canvas Filters
function toggleGreyscale(greyscaleIsSet){
    images[currentImageIndex].greyscale = greyscaleIsSet
    renderCanvas()                
}
function toggleSepia(sepiaIsSet){
    images[currentImageIndex].sepia = sepiaIsSet
    renderCanvas()                
}
function setBrightness(newBrightness){
    images[currentImageIndex].brightness = parseInt(newBrightness)
    renderCanvas()
}
function invert(invertIsSet){
    images[currentImageIndex].invert = invertIsSet
    renderCanvas()                
}


function activePaint(paintIsSet){
    paint = paintIsSet

    renderCanvas()
    
}

// Canvas Image Convolutions 
function embossImageConvolution(embosssIsSet){
    images[currentImageIndex].emboss = embosssIsSet
    renderCanvas()
}
function blurImageConvolution(blurIsSet){
    images[currentImageIndex].blur = blurIsSet
    renderCanvas()
}
function sharpenImageConvolution(sharpenIsSet){
    images[currentImageIndex].sharpen = sharpenIsSet
    renderCanvas()
}



Math.radians = function (degrees){
    return degrees * Math.PI / 180
}
function setRotationDegrees(newRotationDegrees){
    images[currentImageIndex].rotation = parseInt(newRotationDegrees)
    renderCanvas()
}

function radiusSize(newRadius)
{
    radius = newRadius
}