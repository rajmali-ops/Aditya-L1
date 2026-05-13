let F1rocketX = 440;
let F1rocketY = 540;
var F2rocketX = 50;
var F2rocketY = 600;
let isLaunching = false;
let frame_one = false;
let frame_two = false;
let frame_three = false;
let frame_3_bg;
let frame_four = true;

// function preload() {
//   // Load the image before setup
// //   bgImage = loadImage('assets/background.jpg');
//   frame_3_bg = loadImage('assets/Frame-3.png');
// }

async function setup() {
    createCanvas(900, 600);
    frame_3_bg = await loadImage('assets/Frame-3.png');
}
function draw() {
    if (frame_one) {
        background(135, 206, 250);
        noStroke();
        drawRocket(F1rocketX, F1rocketY);
        fill(140);
        rect(200, 550, 500, 60); // Ground
        fill(180, 40, 40);
        rect(300, 190, 40, 360); //tower
        fill(100);
        rect(340, 280, 80, 10);
        rect(340, 360, 80, 10);
        if (isLaunching === true) {
            F1rocketY = F1rocketY - 5;
            drawFlame(F1rocketX, F1rocketY);
        }
        if (F1rocketY < -50) {
            frame_one = false;
            frame_two = true;
            // frame_three = true;
        }
    }
    if (frame_two) {
        background(135, 206, 250);

        push();
        translate(F2rocketX, F2rocketY);
        rotate(PI / 4);
        drawRocket(0, 0); // Draw at the translated origin
        drawFlame(0, 0);
        pop();
        F2rocketX += 2; // Moves Right
        F2rocketY -= 2; // Moves Up
        if (F2rocketX > 900) {
            frame_two = false;
            frame_three = true;
        }
    }
    if (frame_three) {
        background(frame_3_bg);
        push();
        translate(450, 500);
        rotate(PI / 3);
        drawRocket(-100, 120);
        drawFlame(-100, 120);
        pop();
    }
    if (frame_four) {
        background(0);
        drawEarth(700, 300);

    }

}

function mousePressed() {
    isLaunching = true;
}
function drawRocket(x, y) {
    push();
    translate(x, y); // Move the origin (0,0)
    rectMode(CENTER);
    noStroke();

    fill(240);
    rect(0, -60, 40, 120); // PS1
    fill(240);
    rect(0, -160, 40, 80); // PS2
    fill(128, 0, 0);
    rect(0, -220, 40, 40); // PS3
    fill(240);
    rect(0, -255, 40, 30); // PS4
    // Payload Fairing 
    fill(240);
    rect(0, -280, 40, 20);
    triangle(-20, -290, 20, -290, 0, -340);
    // Flag Colors 
    fill(255, 153, 51);
    rect(0, -170, 40, 5);
    fill(255);
    rect(0, -165, 40, 5);
    fill(19, 136, 8);
    rect(0, -160, 40, 5)
    // Left Booster
    fill(128, 0, 0);
    rect(-28, -40, 16, 80);
    triangle(-36, -80, -20, -80, -28, -95);
    fill(80);
    rect(-28, 5, 12, 10);
    // Right Booster
    fill(128, 0, 0);
    rect(28, -40, 16, 80);
    triangle(20, -80, 36, -80, 28, -95);
    fill(80);
    rect(28, 5, 12, 10);
    fill(80);
    quad(-15, 0, 15, 0, 20, 15, -20, 15);
    pop();
}
function drawFlame(x, y) {
    push();
    translate(x, y);
    noStroke();

    // Main engine core flame
    fill(255, 150, 0, 200);
    triangle(-15, 15, 15, 15, random(-5, 5), random(40, 70));
    fill(255, 255, 0, 200);
    triangle(-10, 15, 10, 15, random(-3, 3), random(30, 50));

    // Booster flames
    fill(255, 150, 0, 200);
    triangle(-32, 10, -24, 10, -28 + random(-2, 2), random(25, 45));
    triangle(24, 10, 32, 10, 28 + random(-2, 2), random(25, 45));

    pop();
}
function drawEarth(x, y) {
  push();
  translate(x, y);
  rotate(frameCount * 0.01); 
  textAlign(CENTER, CENTER);
  textSize(100);
  text("🌍", 0, 0); 
  pop();
}