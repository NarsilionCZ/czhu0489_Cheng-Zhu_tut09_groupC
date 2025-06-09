let stripes = [];           // Array to store all line stripe objects
let currentStripe = 0;      // Index of the current stripe being animated

let mode = 0;               // Drawing mode: 0 = cross pattern, 1 = parallel lines

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  background(240, 240, 225);

  // Define ranges for stripe placement
  let rangeX = windowWidth * 0.3;
  let rangeY = windowHeight * 0.3;
  let rangeLength = windowWidth * 0.5;

  // Define angle options based on drawing mode
  let baseAngles;
  if (mode == 0) {
    baseAngles = [0, 90, -90]; // cross pattern
  } else if (mode == 1) {
    baseAngles = [0];          // parallel horizontal lines
  }

  // Generate 100 line stripe objects
  for (let i = 0; i < 100; i++) {
    stripes.push(new LineStripe(
      random(-rangeX, rangeX),          // x position
      random(-rangeY, rangeY),          // y position
      random(20, rangeLength),          // length of each line
      random(0.1, 8),                   // spacing between lines
      floor(random(6, 50)),             // number of lines in each stripe
      random(baseAngles),               // angle of rotation
      random(0.1, 1)                    // base stroke weight
    ));
  }
}

function draw() {
  translate(width / 2, height / 2);  

  // Animate stripes one at a time
  if (currentStripe < stripes.length) {
    stripes[currentStripe].displayStep();
    if (stripes[currentStripe].done) {
      currentStripe++;
    }
  } else {
    noLoop(); // Stop drawing once all stripes are done
  }

  drawModeButton(); // Draw UI button
}

// Draws a button at the bottom left corner to toggle drawing mode
function drawModeButton() {
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
    mode === 1 ? "Switch to cross" : "Switch to parallel",
    x + btnW / 2,
    y + btnH / 2
  );
  pop();
}

// Handle mouse click for toggling modes
function mousePressed() {
  let margin = 0.025 * min(width, height);
  let btnW = 0.25 * width;
  let btnH = 0.06 * height;
  let x = margin;
  let y = height - btnH - margin;

  if (
    mouseX >= x && mouseX <= x + btnW &&
    mouseY >= y && mouseY <= y + btnH
  ) {
    mode = mode === 1 ? 0 : 1;

    // Reset everything and rerun setup
    stripes = [];
    currentStripe = 0;
    loop();
    setup();
  }
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  background(240, 240, 225); 
  stripes = [];
  currentStripe = 0;
  setup(); // regenerate stripes on resize
}

// LineStripe class for generating and animating a set of lines
class LineStripe {
  constructor(x, y, len, spacing, count, angle, baseWeight) {   
    this.x = x;                        //Position of line
    this.y = y;                        //Position of line
    this.len = len;                    //Length of line
    this.spacing = spacing;            //Spacing of line
    this.count = count;                //Number of lines in the stripe
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
      let m = round(random(3));                           // direction modifier (0 or 1)
      this.lines.push({ offsetY, opacity, weight, m });   
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
      
      //Decide the growing direction of line based on mode
      if (l.m == 0) {
        line(0 + l.offsetY, l.offsetY, this.currentLen + l.offsetY, l.offsetY);
      } else {
        line(this.len + l.offsetY, l.offsetY, this.len - this.currentLen + l.offsetY, l.offsetY);
      }
    }

    // Animate growth of lines
    if (this.currentLen < this.len) {
      this.currentLen += 10;
    } else {
      this.done = true; //Mark done and continue to draw the next lines
    }
    pop();
  }
}