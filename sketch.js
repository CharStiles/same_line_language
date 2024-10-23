let svgData; // Variable to store the SVG data
let svgShapeData; // Variable to store the SVG data
let startFrame = 0; // Starting frame
let endFrame = 400; // Ending frame
let currentFrame = startFrame; // Current frame
let startIndex = 0;
let windowSize = 10;
let inc
let currentShapeSetIndex = 0;
let polylines
let polylines2
let videoPlayer;
let scrollPos= -300;
let scrollSpeed = 5;
let shapeAlpha;
// JS Object
let params = {

  trailLength: 50, 
  playbackSpeed: 30,
  lineThickness: 1.0,
  leftRightSeperate:false,
  showEased:true,
  lineThickness: 2,
  fill:false,
  hullConstant: 60,
  resampleSize: 10,
  smoothAmount: 3,
  windowPct:33,
  scrollSpeed:5,
  shapeFill:false
  
};


let gui = new dat.GUI();
gui.add(params, "trailLength").min(1.0).max(200.0).step(1.0);
gui.add(params, "playbackSpeed").min(0.01).max(200.0).step(0.1);
gui.add(params, "lineThickness").min(0.1).max(8.0).step(0.01);
gui.add(params, "scrollSpeed").min(0.1).max(8.0).step(0.01);
gui.add(params, "windowPct").min(1).max(100).step(1);
gui.add(params,"shapeFill")

// Define an array to hold the data for each shape set
let shapeSets = [];

// Function to preload all shape sets
function preload() {
  const shapeNames = [
    "1. SAME", "2. SAME-AS", "3. SAME-ME", "4. SAME-ME-OTHER", "5. SAME-YOU-OTHER",
    "6. BE-SAME", "7. SAME-TIME", "8. SAME-SAME", "9. SAME-SAME", "10. SAME-SAME",
    "11. SAME-OLD", "12. SAME-REPEAT", "13. SAME-LIKE", "14. SAME-VERY", "15. SAME-TOO"
  ];

  shapeNames.forEach(name => {
    let shapeSet = {
      svgData: loadStrings(`15 Shapes of Same\\${name}.svg`),
      svgShapeData: loadStrings(`15 Shapes of Same\\${name} shape.svg`),
      videoPlayer: createVideo(`15 Shapes of Same\\${name}.webm`),
      polylines: null,
      polylines2: null
    };
    
    shapeSet.videoPlayer.hide();
    shapeSet.videoPlayer.loop();
    shapeSet.videoPlayer.volume(0);
    shapeSet.videoPlayer.play();

    shapeSets.push(shapeSet);
  });
}

// Function to parse SVG data for each shape set
function parseSVGs() {
  shapeSets.forEach(set => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(set.svgData.join(''), 'image/svg+xml');
    set.polylines = doc.querySelectorAll("polyline");

    let docShape = parser.parseFromString(set.svgShapeData.join(''), 'image/svg+xml');
    set.polylines2 = docShape.querySelectorAll("polygon");
  });
}

// Call parseSVGs after preload
function setup() {
  preload();
  parseSVGs();
  let c= createCanvas(windowWidth, windowHeight);
  // parseSVG(svgData);
  // parseSVG2(svgShapeData);
  scrollPos = -300; 
}

let shapeX1 = 100;
let shapeX2 = 100;
let videoFrame = 0;
let videoStartScroll = 50; // Start moving video after scrolling this amount

// function setup() {
// }
// Prevent scrolling on the entire document
document.addEventListener('wheel', (event) => {
  event.preventDefault();
  scrollSpeed = params.scrollSpeed;
  if (event.deltaY < 0) {
    scrollPos -= scrollSpeed;
  } else if (event.deltaY > 0) {
    scrollPos += scrollSpeed;
  }
}, { passive: false }); // Mark the event listener as passive


function draw() {
 background(0);

  // Check if scrollPos exceeds height and update the shape set index
  if (scrollPos > height) {
    scrollPos = -300; // Reset scroll position
    currentShapeSetIndex = (currentShapeSetIndex + 1) % shapeSets.length; // Increment index and wrap around
  }

  // Get the current shape set based on the index
  let currentShapeSet = shapeSets[currentShapeSetIndex];

  // // Draw the current shape set's video and shapes
  // push()
  // translate(width / 2 - (currentShapeSet.videoPlayer.width / 2), videoOffset);

  // pop()
  push();
  let videoOffset = scrollPos - videoStartScroll;
  // translate(width / 2 - (currentShapeSet.videoPlayer.width / 2), height / 2 - (currentShapeSet.videoPlayer.height / 2));
  translate(width / 2 - (currentShapeSet.videoPlayer.width / 2),videoOffset);
  drawVideo(currentShapeSet);   // Draw the video using the current shape set
  // translate(0, (height / 2 - (currentShapeSet.videoPlayer.height / 2))*-1);
// translate(0,videoOffset)
  drawShape(currentShapeSet);  // Draw the shape using the current shape set
  pop();
}

// Function to draw the shape for the current shape set
function drawShape(shapeSet) {
  if (shapeSet.polylines2 != null) {
    for (let i = 0; i < shapeSet.polylines2.length; i++) {
      let p = shapeSet.polylines2[i].getAttribute("points").split(' ');

      strokeWeight(params.lineThickness);
      beginShape();
      // Set tint with shapeAlpha for transparency
if (params.shapeFill){
  
  tint(255, constrain((190-shapeAlpha)*1.25,0,255)); // Display at shapeAlpha
  fill(255, constrain((190-shapeAlpha)*1.25,0,255))
  stroke(255, 255); // Use shapeAlpha for fill transparency
// shapeAlpha
}
else{

  noFill()
  tint(255, 255); // Display at shapeAlpha
  stroke(255, 255); // Use shapeAlpha for fill transparency

}
   
      for (let j = 0; j < p.length; j++) {
        let [x, y] = p[j].split(',');
        vertex(640 - x, y);
      }
      endShape();
      // tint(255, 255); // Reset tint to full opacity
}
}
}

function drawVideo(shapeSet) {
  // Calculate the center of the screen
  let centerY = height / 2;
  let videoHeight = shapeSet.videoPlayer.height;
   // Calculate the vertical position of the video
   let videoOffset = scrollPos - videoStartScroll; // Adjust based on your scrolling logic
   let videoPosition = videoOffset + (videoHeight / 2); // Center the video
 
   // Define the boundaries for the middle third of the page
  //  let middleStart = height / 3; // Start of the middle third
  //  let middleEnd = ((height ) / 3)*2.; // End of the middle third
  let middleStart = (height / 2 )- (height* (params.windowPct /100.))/2.; // Start of the middle third
  let middleEnd = (height / 2) + (height* (params.windowPct/100))/2.; // End of the middle third
  console.log("videoPosition:", videoPosition, "middleEnd:", middleEnd);

   // Calculate shapeAlpha based on the video position
   shapeAlpha = 0; // Default to 0
   if (videoPosition >= middleStart && videoPosition <= middleEnd) {
     // Calculate the alpha based on the position within the middle third
     if (videoPosition < centerY) {
       // Fade in from middleStart to centerY
       shapeAlpha = map(videoPosition, middleStart, centerY, 0, 255);
     } else {
       // Fade out from centerY to middleEnd
       shapeAlpha = map(videoPosition, centerY, middleEnd, 255, 0);
     }
   }
  //let shapeAlpha = (constrain(scrollPos / height, 0., 1.)) * 255;
  tint(255, shapeAlpha); // Display at half
  image(shapeSet.videoPlayer, 0, 0, shapeSet.videoPlayer.width, shapeSet.videoPlayer.height);
  
  // find the max end frame
  let maxEndFrame = 0;

  for (let i = 0; i < shapeSet.polylines.length; i++) {
    let endFrame = parseFloat(shapeSet.polylines[0].getAttribute("data-endframe"))

    if (endFrame > maxEndFrame) {
      maxEndFrame = endFrame;
    }
  }
  

  windowSize = params.trailLength;
  let speedFactor = params.playbackSpeed;
  speedFactor = speedFactor/30;
  let count = frameCount* speedFactor % (maxEndFrame+windowSize*2);
  count -= windowSize;
  

  // let's find the maxium end frame
  // and min start frame 

  maxEndFrame = 0;
  startIndex = 1000000;
  if (shapeSet.polylines != null)
  for (let i = 0; i < shapeSet.polylines.length; i++) {
    let endFrame = parseFloat(shapeSet.polylines[i].getAttribute("data-endframe"))
    let startFrame = parseFloat(shapeSet.polylines[i].getAttribute("data-startframe"))
    if (endFrame > maxEndFrame) {
      maxEndFrame = endFrame;
    }
    if (startFrame < startIndex) {
      startIndex = startFrame;
    }
  }
  

// get video pct 
  let pct = shapeSet.videoPlayer.time() / shapeSet.videoPlayer.duration();
  count = (pct) * (maxEndFrame); //+windowSize*2);
 
  if (shapeSet.polylines != null) 
  for (let i = 0; i < shapeSet.polylines.length; i++) {
    let points = shapeSet.polylines[i].getAttribute("points").split(' ');

    let startFrame = parseFloat(shapeSet.polylines[i].getAttribute("data-startframe"))

    strokeWeight(params.lineThickness);
    
    // Set tint with shapeAlpha for transparency
    tint(255, shapeAlpha); // Apply tint with shapeAlpha

    stroke(255, shapeAlpha); // Use shapeAlpha for fill transparency
    noFill(); // Ensure no stroke is applied
push()
    beginShape();
    
    for (let j = 0; j < points.length; j++) {
      let [x, y] = points[j].split(',');  
      let frame = startFrame + j;
      if (frame > count - 10 && frame < count) {
        vertex(640 - x, y);
      }
    }
    endShape();
  }
  pop()
}

// Automatically re-draw on window scroll
function windowScrolled() {
  redraw();
}

// Optionally resize canvas on window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

