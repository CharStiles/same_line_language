let svgData; // Variable to store the SVG data
let polylines = []; // Array to store polyline data
let startFrame = 0; // Starting frame
let endFrame = 400; // Ending frame
//let windowWidth = 100; // Width of the window to draw lines
let frameIncrement = 1; // Frame increment
let currentFrame = startFrame; // Current frame
let startIndex = 0;
let windowSize = 10;
let inc;
let drawingWidth;
let dropZone;
let allLines = [];
let rightLines = [];
let leftLines = [];

let hullPoints = [];
let hullPointsRight = [];
let hullPointsLeft = [];

let exportButton;

let gui;

function preloadHull() {
  svgData = loadStrings(
    "https://cdn.glitch.global/86fd1e3b-c52e-452b-aeb7-3995ad16d77e/svg.svg?v=1715019471170"

    //"svg.svg"
  ); // Load SVG file
}

let paramsHull = {
  leftRightSeperate:false,
  showEased:true,
  lineThickness: 5,
  fill:false,
  hullConstant: 60,
  resampleSize: 10,
  smoothAmount: 3
};


let data = {
  fill: [],
  stroke: [],
  strokeWidth: [],
  startFrame: [],
  endFrame: [],
  handFingers: {},
};

//let handFingers = {};

function setuphull() {


  console.log("setup");
  let c = createCanvas(windowWidth, windowHeight);
  parseSVG(svgData);
  // Allow the canvas to accept dropped files
  c.drop(gotFile);
  noFill();
  strokeWeight(3);
    let gui = new dat.GUI();
  gui.add(params, "leftRightSeperate");
  gui.add(params, "hullConstant").min(22).max(400).step(1).onChange(()=>{
    hullPoints = hull(allLines, params.hullConstant);
    hullPointsRight = hull(rightLines, params.hullConstant);
    hullPointsLeft = hull(leftLines, params.hullConstant);
  });
  //gui.add(params, "showUnsmoothed");
  gui.add(params, "fill");
  gui.add(params, "lineThickness").min(0.1).max(8.0).step(0.01);
  gui.add(params, "resampleSize").min(1).max(100).step(1);
  gui.add(params, "smoothAmount").min(1).max(100).step(1);
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}
//delete later
function gotFile(file) {
  console.log("Got file!  ");
  // Check if the dropped file is an SVG
  if (file.type == "image") {
    // Load the SVG data
    console.log("Loading file");
    svgData = loadStrings(file.data, parseSVG);
  } else {
    print("Not an SVG file!", file.type);
  }
}

function drawHull(params) {
  background(0);

  stroke(255, 0, 0);
  //noFill();

  stroke(255);
  let prevY = 0,
    prevX = 0;

  let n = 10; // Number of sample points along the line
  let prevPoint;
  let prevPointEase = hullPoints[0];
  let x, y;
  strokeWeight(params.lineThickness);

  // calculate the bounds of the drawing
  let minx = 10000000;
  let miny = 10000000;
  let maxx = -10000000;
  let maxy = -10000000;
  for (let j = 0; j < hullPoints.length; j++) {
    let x = hullPoints[j][0];
    let y = hullPoints[j][1];
    if (j == 0) {
      minx = x;
      maxx = x;
      miny = y;
      maxy = y;
    } 
    if (x < minx) {
      minx = x;
    }
    if (x > maxx) {
      maxx = x;
    }
    if (y < miny) {
      miny = y;
    }
    if (y > maxy) {
      maxy = y;
    }
  }
  //calcuate the center of the drawing
  let centerx = (maxx + minx) / 2;
  let centery = (maxy + miny) / 2;
  
  push();
  translate(width/2-centerx,height/2-centery);

  //  // draw the finger strokes
   for (let i = 0; i < 6; i++) {
    //stroke(255);
    strokeWeight(1.);
     if(data.handFingers["left"] == undefined){continue}
    let points = data.handFingers["left"][i];
    beginShape();
     if(points == undefined){continue}
    for (let j = 0; j < points.length; j++) {
      let x = points[j].x;
      let y = points[j].y;
      vertex(x, y, 0);
    }
    endShape();
  }

  for (let i = 0; i < 6; i++) {
    //stroke(255);
    strokeWeight(1.);
    if(data.handFingers["right"] == undefined){continue}

    let points = data.handFingers["right"][i];
    beginShape();
    if(points == undefined){continue}
    for (let j = 0; j < points.length; j++) {
      let x = points[j].x;
      let y = points[j].y;
      vertex(x, y, 0);
    }
    endShape();
  }


  if (params.leftRightSeperate == false) {
    let newLine = getResampledBySpacing(hullPoints,params.resampleSize);
    newLine = getSmoothed(newLine,params.smoothAmount);
    stroke(255,0,0);
    strokeWeight(params.lineThickness);

    if (params.fill) {
      //noStroke();
      fill(255,0,0,190);
    }
    beginShape();
    for (let i = 0; i < newLine.length; i++) {
      let x = newLine[i][0];
      let y = newLine[i][1];
      vertex(x, y, 0);
    }
    endShape(CLOSE);
  } else {
     // draw left 
    let newLine = getResampledBySpacing(hullPointsLeft,params.resampleSize);
    newLine = getSmoothed(newLine,params.smoothAmount);
    stroke(255,0,0);
    if (params.fill) {
      //noStroke();
      fill(255,0,0,190);
    }
    strokeWeight(params.lineThickness);
    beginShape();
    for (let i = 0; i < newLine.length; i++) {
      let x = newLine[i][0];
      let y = newLine[i][1];
      vertex(x, y, 0);
    }
    endShape(CLOSE);

    newLine = getResampledBySpacing(hullPointsRight,params.resampleSize);
    newLine = getSmoothed(newLine,params.smoothAmount);
    stroke(0,255,0);
    strokeWeight(params.lineThickness);
    if (params.fill) {
      //noStroke();
      fill(0,255,0,190);
    }
    beginShape();
    for (let i = 0; i < newLine.length; i++) {
      let x = newLine[i][0];
      let y = newLine[i][1];
      vertex(x, y, 0);
    }
    endShape(CLOSE);

  }

  pop();

}

//Delete later
function parseSVGHull() {
  let parser = new DOMParser(); // Create a DOM parser
  let doc = parser.parseFromString(svgData.join(""), "image/svg+xml"); // Parse SVG data
  let drawingWidth = 0;
  let polylines = doc.querySelectorAll("polyline");
  data.handFingers = [];
  data.fill = [];
  data.strokes = [];
  data.startFrames = [];
  data.endFrames = [];
  hullPoints = [];

  allLines = []
  rightLines = [];
  leftLines = [];

  console.log("polylines", polylines.length);

  for (let i = 0; i < polylines.length; i++) {
    let points = polylines[i].getAttribute("points").trim().split(" ");
    let hand = polylines[i].getAttribute("data-hand");
    let finger = polylines[i].getAttribute("data-finger");

    console.log("hand", hand, "finger", finger);
    data.strokes.push(polylines[i].getAttribute("stroke"));
    data.strokeWidth.push(polylines[i].getAttribute("stroke-width"));
    //params.lineThickness = polylines[i].getAttribute("stroke-width");
    data.fill.push(polylines[i].getAttribute("fill"));
    data.endFrames.push(polylines[i].getAttribute("endFrames"));
    data.startFrames.push(polylines[i].getAttribute("startFrames"));
    let strokes;
    if (!data.handFingers[hand]) {
      data.handFingers[hand] = {};
    }
    if (!data.handFingers[hand][finger]) {
      data.handFingers[hand][finger] = [];
    }
    for (let j = 0; j < points.length; j++) {
      let [xx, yy] = points[j].split(",");
      let [x, y] = [parseFloat(xx), parseFloat(yy)];    // we have to parse the string to a float (some string errors) 
      data.handFingers[hand][finger].push(createVector(float(x), float(y)));
       allLines.push([x, y]);
      if (hand == "right") {
        rightLines.push([x, y]);
      } else {  
        leftLines.push([x, y]);
      }
    }
  }
  
//     let parser = new DOMParser(); // Create a DOM parser
//   let doc = parser.parseFromString(svgData.join(''), 'image/svg+xml'); // Parse SVG data
//   polylines = doc.querySelectorAll("polyline");
//   for (let i = 0; i < polylines.length; i++) {
//     let points = polylines[i].getAttribute("points").split(' ');
//     for (let j = 0; j < points.length; j++) {
//       let [x, y] = points[j].split(',');  
//       drawingWidth = max(drawingWidth,x)
//   }
// }

  //// randomize the order of the allLines array
  
  console.log("allLines", allLines.length);
  console.log("drawingWidth", drawingWidth);
  // print the min and max values of the allLines array -- 
  // this will give you the bounding box of the drawing
  // let minx = 10000000;
  // let miny = 10000000;
  // let maxx = -10000000;
  // let maxy = -10000000;
  // console.log(minx);
  // for (let j = 0; j < allLines.length; j++) {
  //   let x = allLines[j][0];
  //   let y = allLines[j][1];
  //   if (j == 0) {
  //     minx = x;
  //     maxx = x;
  //     miny = y;
  //     maxy = y;
  //   } 
  //   if (x < minx) {
  //     minx = x;
  //   }
  //   if (x > maxx) {
  //     maxx = x;
  //   }
  //   if (y < miny) {
  //     miny = y;
  //   }
  //   if (y > maxy) {
  //     console.log(maxy + " " + y);
  //     maxy = y;
  //   }
  // }
  // console.log("minx", minx);
  // console.log("maxx", maxx);
  // console.log("miny", miny);
  // console.log("maxy", maxy);

  //console.log(allLines);
  hullPoints = hull(allLines, params.hullConstant);
  hullPointsRight = hull(rightLines, params.hullConstant);
  hullPointsLeft = hull(leftLines, params.hullConstant);

}




function getResampledBySpacing(poly0,spacing) {
  if(spacing==0 || poly0.length == 0) return poly0;
  let poly = [];
  let acc_len = [0];
  let tot_len = 0;
  for (let i = 0; i < poly0.length-1; i++){
    if(poly0[i] == undefined){continue}
    let [x0,y0] = poly0[i];
    let [x1,y1] = poly0[i+1];
    tot_len += Math.hypot(x1-x0,y1-y0);
    acc_len.push(tot_len);
  }
  function getPointAtLength(l){
    for (let i = poly0.length-1; i >= 0; i--){
      if (acc_len[i] <= l){
        let t = (l - acc_len[i])/(acc_len[i+1] - acc_len[i]);
        return [
          poly0[i][0] * (1-t) + poly0[i+1][0] * t,
          poly0[i][1] * (1-t) + poly0[i+1][1] * t,
        ];
      }
    }
    return [0,0];
  }

  for (let f = 0; f < tot_len; f += spacing){
    poly.push(getPointAtLength(f));
  }
  if(poly.length) poly.push(poly0[poly0.length-1]);
  return poly;
}

function clamp(a,b,c){
  return min(max(a,b),c);
}

function getSmoothed(poly,smoothingSize,smoothingShape=0, closed=true){
  // https://github.com/openframeworks/openFrameworks/blob/c21aba181f5180a8f4c2e0bcbde541a643abecec/libs/openFrameworks/graphics/ofPolyline.inl#L470
  let n = poly.length;
  smoothingSize = clamp(smoothingSize, 0, n);
  smoothingShape = clamp(smoothingShape, 0, 1);
  
  // precompute weights and normalization
  let weights = new Array(smoothingSize);
  // side weights
  for(let i = 1; i < smoothingSize; i++) {
    let curWeight = map(i, 0, smoothingSize, 1, smoothingShape);
    weights[i] = curWeight;
  }
  // make a copy of this polyline
  let result = poly.map(xy=>[...xy]);
  let bClosed = closed;
  for(let i = 0; i < n; i++) {
    let sum = 1; // center weight
    for(let j = 1; j < smoothingSize; j++) {
      let curx = 0;
      let cury = 0;
      let leftPosition = i - j;
      let rightPosition = i + j;
      if(leftPosition < 0 && bClosed) {
        leftPosition += n;
      }
      if(leftPosition >= 0) {
        curx += poly[leftPosition][0];
        cury += poly[leftPosition][1];
        sum += weights[j];
      }
      if(rightPosition >= n && bClosed) {
        rightPosition -= n;
      }
      if(rightPosition < n) {
        curx += poly[rightPosition][0];
        cury += poly[rightPosition][1];
        sum += weights[j];
      }
      result[i][0] += curx * weights[j];
      result[i][1] += cury * weights[j];
    }
    result[i][0] /= sum;
    result[i][1] /= sum;
  }
  
  return result;
}