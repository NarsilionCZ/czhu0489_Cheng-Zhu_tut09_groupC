let stripes = [];           // Array to store all line stripe objects
let currentStripe = 0;      // Index of the current stripe being animated

//global variables for disturbance animation
let disturbed = false;
let disturbTimer = 0;
let disturbInterval = 100;
let disturbDuration = 15; 
let disturbedImg = null;
let originalImg = null; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  background(240, 240, 225);

  // Define ranges for stripe placement
  let rangeX = windowWidth * 0.5;
  let rangeY = windowHeight * 0.5;
  let rangeLength = windowWidth * 0.5;
  let baseAngles = [0, 90, -90];

  // Generate 100 line stripe objects
  for (let i = 0; i < 100; i++) {
    stripes.push(new LineStripe(
      random(-rangeX, rangeX),          // x position
      random(-rangeY, rangeY),          // y position
      random(20, rangeLength),          // length of each line
      random(0.1, 6),                   // spacing between lines
      floor(random(6, 20)),             // number of lines in each stripe
      random(baseAngles),               // angle of rotation
      random(0.1, 1)                    // base stroke weight
    ));
  }
}

function draw() {
  translate(width / 2, height / 2);     // Center the drawing context
  // Animate stripes one at a time
  if (currentStripe < stripes.length) {
    stripes[currentStripe].displayStep();
    if (stripes[currentStripe].done) {
      currentStripe++;
    }
    if (currentStripe === stripes.length && !originalImg) { // When all stripes are drawn, save the original image
      resetMatrix();
      originalImg = get(0, 0, width, height);
    }
  } else {
    disturbAnimnation();                                    // and start disturbance animation
  }

  drawButton(); // Draw UI button
}

// Draws a button at the bottom left corner to regenerate stripes
function drawButton() {
  push();
  resetMatrix();//
  // Button position and size adapt to the canvas
  let margin = 0.025 * min(width, height); 
  let btnW = 0.25 * width;   
  let btnH = 0.06 * height;  
  let x = margin;
  let y = height - btnH - margin;

  fill(255, 230, 180, 220);
  stroke(120);
  strokeWeight(2);
  rect(x, y, btnW, btnH, 12);

  fill(60);
  noStroke();
  textSize(btnH * 0.45); // The font size changes according to the height of the button
  textAlign(CENTER, CENTER);
  text(
    "Regenerate",
    x + btnW / 2,
    y + btnH / 2
  );
  pop();
}

// Handle mouse click for regenerating stripes
function mousePressed() {
  let margin = 0.025 * min(width, height);
  let btnW = 0.25 * width;
  let btnH = 0.06 * height;
  let x = margin;
  let y = height - btnH - margin;

  if (                                         // Judgement for whether the mouse is within the button area
    mouseX >= x && mouseX <= x + btnW &&
    mouseY >= y && mouseY <= y + btnH
  ) {
    stripes = [];                              // Reset setup
    currentStripe = 0;
    disturbed = false;
    originalImg = null;
    disturbedImg = null;
    setup();
    loop();
  }
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  background(240, 240, 225); 
  stripes = [];
  currentStripe = 0;
  disturbed = false;
  originalImg = null;
  disturbedImg = null;
  setup(); // regenerate stripes on resize
  loop();
}

// LineStripe class for generating and animating a set of lines
class LineStripe {
  constructor(x, y, len, spacing, count, angle, baseWeight) {   
    this.x = x;                        //Position of line
    this.y = y;                        //Position of line
    this.len = len;                    //Length of line
    this.spacing = spacing;            //Spacing of line
    this.count = count;                // Number of lines in the stripe
    this.angle = angle;                //Angle of line
    this.baseWeight = baseWeight;      //Width of line stroke
    this.lines = [];                   //Array to store the lines
    this.done = false;                 //Flag to indicate if the stripe is fully drawn
    this.currentLen = 0;               //Current line length  
    this.gray = random(10, 200);       //grayscale base color

    // Initialize each line’s parameters
    for (let i = 0; i < this.count; i++) {
      let offsetY = i * this.spacing;                     // avoid overlapping lines
      let opacity = random(2, 100);                       // random opacity
      let weight = this.baseWeight + random(-0.1, 0.5);   // random weight variation
      let direction = round(random(3));                           // direction modifier (0 or 1)
      this.lines.push({ offsetY, opacity, weight, direction });   
    }
  }

  // Draw the line stripe step by step with animation
  displayStep() {
    push();
    translate(this.x, this.y);
    rotate(-this.angle);

    // Draw each line segment with dynamic length
    for (let i = 0; i < this.lines.length; i++) {
      let l = this.lines[i];
      stroke(this.gray, l.opacity);
      strokeWeight(l.weight);
      
      //Decide the growing direction of line 
      if (l.direction == 0) {
        line(0 + l.offsetY, l.offsetY, this.currentLen + l.offsetY, l.offsetY);
      } else {
        line(this.len + l.offsetY, l.offsetY, this.len - this.currentLen + l.offsetY, l.offsetY);
      }
    }

    // Animate growth of lines
    if (this.currentLen < this.len) {
      this.currentLen += 100;
    } else {
      this.done = true; //Mark done and continue to draw the next lines
    }
    pop();
  }
}

// Add disturbPixels function to create a pixel disturbance effect
function disturbPixels() {
  resetMatrix();
  let step = 5;                              // Step size for pixel disturbance
  let disturbRateRow = random(0.05, 0.3);    // Disturbance rate for rows
  let disturbRateCol = random(0.05, 0.3);    // Disturbance rate for columns
  let snap = get(0, 0, width, height);       // Take a snapshot of the current canvas
  let maxOffset = random(20);                // Maximum offset for disturbance
  
  // Create a temporary graphics buffer to draw disturbed image
  // createGraphics() is not covered in the course, see explanation in README
  let tempImg = createGraphics(width, height); 
  tempImg.background(240, 240, 225);
  for (let y = 0; y < height; y += step) {
    if (random() < disturbRateRow) {           
      let noiseX = noise(y * 0.02, frameCount * 0.01);
      let disturbX = int(map(noiseX, 0, 1, -maxOffset, maxOffset)); // Calculate disturbance offset for the row
      let rowImg = snap.get(0, y, width, step);                     // Get the row image from the snapshot
      tempImg.image(rowImg, disturbX, y);                           // Draw the row image with disturbance offset
    } else {
      let rowImg = snap.get(0, y, width, step);                     // Get the row image from the snapshot without disturbance
      tempImg.image(rowImg, 0, y);
    }
  }

  let tempSnap = tempImg.get(0, 0, width, height);                  // Get the row-modified graphics buffer
  for (let x = 0; x < width; x += step) {                           // Same process for columns
    if (random() < disturbRateCol) {
      let noiseY = noise(x * 0.02, frameCount * 0.01 + 1000);
      let disturbY = int(map(noiseY, 0, 1, -maxOffset, maxOffset));
      let colImg = tempSnap.get(x, 0, step, height);
      image(colImg, x, disturbY);
    } else {
      let colImg = tempSnap.get(x, 0, step, height);
      image(colImg, x, 0);
    }
  }
}

// Function to handle the disturbance animation
function disturbAnimnation(){
  disturbTimer++;
  if (disturbTimer === 1) {                                            // When the disturbance starts
      disturbPixels(); 
      disturbedImg = get(0,0, width, height); 
  } else if (disturbTimer > 1 && disturbTimer <= disturbDuration) {    // disturbDuration decides the duration of disturbance
      resetMatrix();
      image(disturbedImg, 0,0);
  } else {                                                             // After disturbance back to original image
    resetMatrix();
    if (originalImg) {
      image(originalImg, 0, 0);
    } 
    if (disturbTimer > disturbInterval) {                              // Reset timer for next disturbance
      disturbTimer = 0;
    }
  }
}