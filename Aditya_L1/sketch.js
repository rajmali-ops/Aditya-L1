let F1rocketX = 440;
let F1rocketY = 540;
var F2rocketX = 50;
var F2rocketY = 600;
let isLaunching = false;
let frame_one = true;
let frame_two = false;
let frame_three = false;
let frame_3_bg;
let frame_four = false;
let frame_five = false;
let frame_six = false;
let escaping = false;
let posX, posY; // Current position
let velX, velY;
let angle = 0;
let speed = 0.06;
let orbitLevel = 0;
let currentW = 50;
let currentH = 40;
let currentOffset = -30;
let inHalo = false;
let haloAngle = 0;
let dismantleStep = 0;
let boosterY = 0, boosterVY = 0;
let boosterX = 0, boosterVX = 1.5; // Sideways push for boosters
let ps1Y = 0, ps1VY = 0;
let ps2Y = 0, ps2VY = 0;
let ps3Y = 0, ps3VY = 0;
let separationForce = 0.15;
let is_rocket = true;
let is_satellite = false;
let SatelliteX = 80;
let SatelliteY = -300;
let myStars = [];
let activePayload = 0; // Tracks which instrument is currently clicked
let rocketSound;

// Data about the 7 scientific instruments on Aditya-L1
const payloads = [
    {
        name: "VELC", full: "Visible Emission Line Coronagraph", type: "Remote Sensing",
        target: "Solar Corona",
        desc: "Blocks the Sun's bright disk to study the Solar Corona (outermost layer) and the dynamics of Coronal Mass Ejections (CMEs).",
        color: [255, 100, 100]
    },
    {
        name: "SUIT", full: "Solar Ultraviolet Imaging Telescope", type: "Remote Sensing",
        target: "Photosphere & Chromosphere",
        desc: "Takes images of the Solar Photosphere and Chromosphere in near-Ultraviolet (UV) light to measure solar radiation variations.",
        color: [100, 150, 255]
    },
    {
        name: "SoLEXS", full: "Solar Low Energy X-ray Spectrometer", type: "Remote Sensing",
        target: "Solar Corona (Soft X-rays)",
        desc: "Measures soft X-ray emissions to study the heating mechanism of the solar corona and solar flares.",
        color: [100, 255, 100]
    },
    {
        name: "HEL1OS", full: "High Energy L1 Orbiting X-ray Spectrometer", type: "Remote Sensing",
        target: "Solar Flares (Hard X-rays)",
        desc: "Observes hard X-ray emissions to study explosive energy release and acceleration of particles during solar flares.",
        color: [255, 255, 100]
    },
    {
        name: "ASPEX", full: "Aditya Solar wind Particle Experiment", type: "In-situ (Local)",
        target: "Solar Wind (Protons/Ions)",
        desc: "Catches particles flying through space to study the variation and properties of solar wind (protons and heavy ions).",
        color: [255, 150, 200]
    },
    {
        name: "PAPA", full: "Plasma Analyser Package for Aditya", type: "In-situ (Local)",
        target: "Solar Plasma (Electrons)",
        desc: "Analyzes the composition of solar wind plasma and its energy distribution right at the L1 point.",
        color: [150, 255, 255]
    },
    {
        name: "MAG", full: "Advanced Tri-axial High Resolution Magnetometers", type: "In-situ (Local)",
        target: "Interplanetary Magnetic Field",
        desc: "Measures the strength and direction of the interplanetary magnetic field passing through the L1 point.",
        color: [200, 150, 255]
    }
];

async function setup() {
    createCanvas(900, 600);
    frame_3_bg = await loadImage('assets/Frame-3.png');
    my_sound = await loadSound('assets/sound.mp3');
    createStars(500);
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
            if (F1rocketY < -50) {
                frame_one = false;
                frame_two = true;
                isLaunching = false;
            }
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
        angleMode(DEGREES);
        updateFallingParts();
        push();
        translate(400, 350);
        if (is_rocket) {
            dismantleRocket(0, 0, 1, 60);
        }
        if (is_satellite) {
            rotate(45);
            drawSatellite(SatelliteX, SatelliteY, 2);
            SatelliteY -= 0.8;
            print(SatelliteY);
        }
        if (SatelliteY < -600) {
            frame_three = false;
            frame_four = true;
        }
        pop();
    }
    if (frame_four) {
        angleMode(RADIANS);
        background(10);
        drawShiningStars();
        // Define static positions for Earth and the L1 Lagrange Point
        let earthX = width * 0.85;
        let earthY = height * 0.7;
        let L1X = width * 0.25;
        let L1Y = height * 0.5;

        // --- 1. VISUAL LAYERS ---
        drawL1Point(L1X, L1Y);          // Draws L1 and the Green/Red Halo path
        drawEarthAndOrbits(earthX, earthY); // Draws Earth and its 4 orbits

        // --- 2. MISSION LOGIC ---

        // STATE A: Orbiting Earth
        if (!escaping && !inHalo) {
            handleEarthOrbits(earthX, earthY);
        }

        // STATE B: Cruise Phase (The journey to L1)
        else if (escaping && !inHalo) {
            posX += velX; // Move forward toward the left
            posY += velY; // Move upward
            velY -= 0.005; // Creates a slight upward curve (parabolic)

            // Insertion Check: If satellite gets close to L1, switch to Halo
            if (posX < L1X + 50) {
                inHalo = true;
            }
        }

        // STATE C: Halo Orbit (Orbiting L1)
        else if (inHalo) {
            // Tall Ellipse Math: Width is 60, Height is 150
            posX = L1X + cos(haloAngle) * 60;
            posY = L1Y + sin(haloAngle) * 150;
            haloAngle += 0.03; // Slower speed for the deep space orbit
        }

        // --- 3. RENDER SATELLITE ---
        drawSatellite(posX, posY, 0.5);
        if (haloAngle > 20) {
            frame_four = false;
            frame_five = true;
        }
    }
    if (frame_five) {
        angleMode(DEGREES);
        background(5, 5, 15);
        drawShiningStars();
        push();
        translate(width / 2, height / 2);
        let orbitRadius = 220;
        let earthX = orbitRadius;
        let earthY = 0;
        let l1x = earthX - 80;

        // --- 1. Realistic Sun ---
        drawSun(0, 0, 100);

        // --- 2. Main Orbit Path ---
        noFill();
        stroke(255, 255, 255, 40);
        circle(0, 0, orbitRadius * 2);

        // --- 3. Green Geometry Lines ---
        stroke(0, 200, 0, 150);
        strokeWeight(1);
        line(-orbitRadius - 0, 0, orbitRadius + 70, 0);

        let l4x = cos(-60) * orbitRadius;
        let l4y = sin(-60) * orbitRadius;
        let l5x = cos(60) * orbitRadius;
        let l5y = sin(60) * orbitRadius;

        line(0, 0, l4x, l4y);
        line(0, 0, l5x, l5y);
        line(earthX, earthY, l4x, l4y);
        line(earthX, earthY, l5x, l5y);

        // --- 4. Aditya-L1 Halo Orbit & Satellite ---
        noFill();
        stroke(0, 255, 0, 100);
        ellipse(l1x, 0, 25, 55);
        push();
        let satX = l1x + cos(angle * 2) * 12.5;
        let satY = sin(angle * 2) * 27.5;
        translate(satX, satY);
        drawSatellite(0, 0, 0.5);
        pop();

        // Drawing the Earth Emoji
        fill(255)
        drawEarth(earthX + 10, earthY);

        noFill();
        stroke(0, 200, 0);
        circle(earthX, earthY, 60); // Moon orbit path
        fill(200);
        noStroke();
        circle(earthX + 22, earthY - 18, 6); // Small Moon

        // --- 6. Lagrange Points Markers & Labels ---
        fill(0, 255, 0);
        circle(l1x, 0, 5);
        circle(earthX + 70, 0, 5);
        circle(-orbitRadius, 0, 5);
        circle(l4x, l4y, 5);
        circle(l5x, l5y, 5);

        fill(255);
        noStroke();
        textSize(16);
        textStyle(BOLD);
        text("L1", l1x, 45);
        text("L2", earthX + 85, 5);
        text("L3", -orbitRadius - 25, 5);
        text("L4", l4x, l4y - 15);
        text("L5", l5x, l5y + 25);

        textSize(12);
        text("Aditya-L1", l1x - 20, -45);
        angle += 1; // Slow rotation for the halo orbit
        if (angle > 600) {
            frame_five = false;
            frame_six = true;
        }
    }
    if (frame_six) {
        background(15, 20, 35);

        // Base coordinates
        let sunX = 150;
        let sunY = height / 2 - 50;
        let satX = 550;
        let satY = height / 2 - 50;

        // 1. Draw Title
        fill(255);
        noStroke();
        textSize(24);
        textAlign(LEFT, TOP);
        text("Aditya-L1 Science Payloads", 20, 20);
        textSize(14);
        fill(200);
        text("Click the instruments on the right to see what they study.", 20, 50);

        // 2. Draw Sun Layers
        sun_info(sunX, sunY);

        // 3. Draw Scanner Beam based on Active Payload
        drawScannerBeam(sunX, sunY, satX, satY);

        // 4. Draw Satellite
        drawSatellite(satX, satY, 1.2);

        // 5. Draw Buttons
        drawButtons();

        // 6. Draw Info Panel
        drawInfoPanel();

        angle += 0.02; // Rotate satellite slightly over time
    }
}
function mousePressed() {
    isLaunching = true;
    if (isLaunching){
        my_sound.play();
    }
    if (dismantleStep <= 5) {
        dismantleStep++;
    }
    if (dismantleStep === 6) {
        is_rocket = false;
        is_satellite = true;
    }
    // Check if a button was clicked
    let btnWidth = 100;
    let btnHeight = 40;
    let startX = 750;
    let startY = 100;
    let spacing = 50;

    for (let i = 0; i < payloads.length; i++) {
        let y = startY + (i * spacing);
        // Simple bounding box collision detection for buttons
        if (mouseX > startX && mouseX < startX + btnWidth && mouseY > y && mouseY < y + btnHeight) {
            activePayload = i;
        }
    }
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
    translate(x - 10, y);
    rotate(frameCount * 0.01);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("🌍", 0, 0);
    pop();
}
function handleEarthOrbits(ex, ey) {
    let targetW, targetH, targetOffset;
    if (orbitLevel === 0) { targetW = 50; targetH = 40; targetOffset = -30; }
    else if (orbitLevel === 1) { targetW = 90; targetH = 60; targetOffset = -60; }
    else if (orbitLevel === 2) { targetW = 140; targetH = 90; targetOffset = -100; }
    else { targetW = 200; targetH = 130; targetOffset = -150; }

    currentW = lerp(currentW, targetW, 0.05);
    currentH = lerp(currentH, targetH, 0.05);
    currentOffset = lerp(currentOffset, targetOffset, 0.05);

    posX = ex + (cos(angle) * currentW + currentOffset);
    posY = ey + (sin(angle) * currentH);
    angle += speed;

    if (orbitLevel === 3 && angle > 3) {
        escaping = true;
        velX = -5;
        velY = -2.5;
    }

    if (angle > TWO_PI) {
        angle = 0;
        if (orbitLevel < 3) orbitLevel++;
    }
}
function drawSatellite(x, y, size = 1) {
    push();
    translate(x, y);
    scale(size)
    rotate(angle + PI / 4);
    rectMode(CENTER);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(255,180,0,0.9)";
    // Solar panels
    fill(50, 120, 255);
    stroke(180);
    rect(-22, 0, 20, 10);
    rect(22, 0, 20, 10);
    // Main body
    fill(190);
    rect(0, 0, 16, 16, 3);
    // Antenna
    stroke(255);
    line(0, -8, 0, -18);
    noFill();
    arc(0, -18, 12, 12, PI, TWO_PI);
    pop();
}
function drawL1Point(x, y) {
    fill(150, 100, 255);
    noStroke();
    circle(x, y, 10); // L1 dot

    fill(255);
    textSize(16);
    text("L1", x - 30, y);
    // text("Halo orbit insertion in L1", x - 50, y - 180);

    // Drawing the visual guide for the Halo Orbit
    noFill();
    strokeWeight(2);
    stroke(255, 30); // Green side (Top)
    arc(x, y, 120, 300, PI, TWO_PI);
    arc(x, y, 120, 300, 0, PI);
}
function drawEarthAndOrbits(ex, ey) {
    fill(255);
    push();
    translate(ex, ey);
    drawEarth(0, 0);
    push();
    textSize(40);
    textAlign(CENTER, CENTER);
    pop();
    noFill();
    stroke(255, 30);
    ellipse(-30, 0, 100, 80);
    ellipse(-60, 0, 180, 120);
    ellipse(-100, 0, 280, 180);
    ellipse(-150, 0, 400, 260);
    pop();
}
function drawSun(x, y, d) {
    push();
    for (let i = d * 1.8; i > d; i -= 2) {
        fill(255, 100, 0, map(i, d, d * 2, 50, 0));
        noStroke();
        circle(x, y, i);
    }
    fill(255, 160, 0);
    circle(x, y, d);
    for (let i = 0; i < 100; i++) {
        let r = random(d / 2.5);
        let a = random(360);
        fill(255, 220, 0, 120);
        circle(cos(a) * r, sin(a) * r, random(2, 4));
    }
    pop();
}
function dismantleRocket(x, y, s, rotAngle) {
    push();
    translate(x, y);
    scale(s);
    rotate(rotAngle); // <--- THIS ROTATES THE ENTIRE ROCKET
    rectMode(CENTER);
    noStroke();

    // --- STEP 1: BOOSTERS ---
    if (dismantleStep >= 0) {
        // LEFT BOOSTER
        push();
        translate(-boosterX, boosterY);
        fill(128, 0, 0);
        rect(-28, -40, 16, 80);
        triangle(-36, -80, -20, -80, -28, -95);
        fill(80);
        rect(-28, 5, 12, 10);
        fill(255, 150, 0, 200);
        triangle(-32, 10, -24, 10, -28 + random(-2, 2), random(25, 45));
        pop();

        // RIGHT BOOSTER
        push();
        translate(boosterX, boosterY);
        fill(128, 0, 0);
        rect(28, -40, 16, 80);
        triangle(20, -80, 36, -80, 28, -95);
        fill(80);
        rect(28, 5, 12, 10);
        fill(255, 150, 0, 200);
        triangle(24, 10, 32, 10, 28 + random(-2, 2), random(25, 45));
        pop();
        // drawFlame(28, 40);
    }


    // --- FINAL PAYLOAD & PS4 ---
    push();
    fill(240);
    rect(0, -255, 40, 30);
    fill(240);
    rect(0, -280, 40, 20);
    triangle(-20, -290, 20, -290, 0, -340);
    fill(255, 150, 0, 200);
    triangle(-20, -240, 20, -240, random(-5, 5), random(40, 70));
    fill(255, 255, 0);
    triangle(-15, -240, 15, -240, random(-3, 3), random(20, 30));
    pop();

    // --- STEP 4: PS3 (THIRD STAGE) ---
    push();
    translate(0, ps3Y);
    fill(128, 0, 0);
    rect(0, -220, 40, 40);
    fill(255, 150, 0);
    triangle(-20, -200, 20, -200, random(-5, 5), random(40, 70));
    fill(255, 255, 0);
    triangle(-15, -200, 15, -200, random(-3, 3), random(20, 30));
    pop();

    // --- STEP 3: PS2 (SECOND STAGE + FLAG) ---
    push();
    translate(0, ps2Y);
    fill(240);
    rect(0, -160, 40, 80);
    fill(255, 150, 0, 200);
    triangle(-15, -120, 15, -120, random(-5, 5), random(40, 70));
    fill(255, 255, 0, 200);
    triangle(-10, -120, 10, -120, random(-3, 3), random(30, 50));
    fill(255, 153, 51);
    rect(0, -170, 40, 5);
    fill(255);
    rect(0, -165, 40, 5);
    fill(19, 136, 8);
    rect(0, -160, 40, 5);
    pop();


    // --- STEP 2: PS1 (FIRST STAGE) ---
    push();
    translate(0, ps1Y);
    fill(240);
    rect(0, -60, 40, 120);
    fill(80);
    quad(-15, 0, 15, 0, 20, 15, -20, 15);
    fill(255, 150, 0, 200);
    triangle(-15, 15, 15, 15, random(-5, 5), random(40, 70));
    fill(255, 255, 0, 200);
    triangle(-10, 15, 10, 15, random(-3, 3), random(30, 50));
    pop();



}
function updateFallingParts() {
    // Instead of fixed speed, we increase the velocity (VY) every frame
    if (dismantleStep >= 2) {
        boosterVY += separationForce;
        boosterY += boosterVY;        // Moves down faster over time
        boosterX += boosterVX;        // Drifts outward
    }

    if (dismantleStep >= 3) {
        ps1VY += separationForce;
        ps1Y += ps1VY;
    }

    if (dismantleStep >= 4) {
        ps2VY += separationForce;
        ps2Y += ps2VY;
    }

    if (dismantleStep >= 5) {
        ps3VY += separationForce;
        ps3Y += ps3VY;
    }
}
function createStars(starCount) {
    for (let i = 0; i < starCount; i++) {
        myStars.push({
            x: random(width),              // Random horizontal position
            y: random(height),             // Random vertical position
            size: random(1, 3),            // Random size between 1 and 3 pixels
            blinkSpeed: random(0.02, 0.1)  // Random twinkling speed
        });
    }
}
function drawShiningStars() {
    noStroke(); // No outlines on the stars

    for (let i = 0; i < myStars.length; i++) {
        let s = myStars[i]; // Get the current star from our list

        // The Magic Math: 
        // sin() creates a smooth wave that goes up and down forever.
        // We map that wave to a brightness level between 50 (dim) and 255 (bright).
        let brightness = map(sin(frameCount * s.blinkSpeed + s.x), -1, 1, 50, 255);

        // Set the color to white, but change the transparency (brightness)
        fill(255, brightness);

        // Draw the star!
        circle(s.x, s.y, s.size);
    }
}
// --- VISUAL FUNCTIONS ---
function sun_info(x, y) {
    noStroke();

    // Corona (Outer glow)
    fill(255, 100, 50, 40);
    circle(x, y, 280);

    // Chromosphere
    fill(255, 150, 0, 100);
    circle(x, y, 200);

    // Photosphere (Inner Sun)
    fill(255, 220, 0);
    circle(x, y, 150);

    // Layer Labels
    fill(255, 150);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Corona", x, y - 120);
    text("Chromosphere", x, y - 80);
    text("Photosphere", x, y);
}
function drawScannerBeam(sx, sy, satX, satY) {
    let p = payloads[activePayload];
    strokeWeight(2);

    // Add a pulsing alpha effect
    let pulse = map(sin(frameCount * 0.1), -1, 1, 100, 255);
    stroke(p.color[0], p.color[1], p.color[2], pulse);

    // Draw dashed line towards the target
    drawingContext.setLineDash([10, 10]); // Make line dashed

    if (p.type === "Remote Sensing") {
        // Beam goes to the Sun
        let targetRadius = 0;
        if (p.target.includes("Corona")) targetRadius = 140;
        else if (p.target.includes("Photosphere")) targetRadius = 75;
        else targetRadius = 100;

        line(satX - 40, satY, sx + targetRadius, sy);
    } else {
        // In-situ (Local) -> Beam scans the area right around the satellite
        noFill();
        circle(satX, satY, 150 + map(sin(frameCount * 0.05), -1, 1, 0, 30));
    }

    drawingContext.setLineDash([]); // Reset line dash
}
function drawButtons() {
    let btnWidth = 100;
    let btnHeight = 40;
    let startX = 750;
    let startY = 100;
    let spacing = 50;

    textAlign(CENTER, CENTER);
    textSize(14);

    for (let i = 0; i < payloads.length; i++) {
        let y = startY + (i * spacing);
        let p = payloads[i];

        // Highlight the active button
        if (i === activePayload) {
            stroke(255);
            strokeWeight(2);
            fill(p.color[0], p.color[1], p.color[2], 200);
        } else {
            noStroke();
            fill(50, 60, 80);
        }

        rect(startX, y, btnWidth, btnHeight, 5); // Rounded rectangle

        fill(255);
        noStroke();
        text(p.name, startX + btnWidth / 2, y + btnHeight / 2);
    }
}
function drawInfoPanel() {
    let p = payloads[activePayload];

    fill(30, 40, 60, 200);
    stroke(p.color[0], p.color[1], p.color[2]);
    strokeWeight(2);
    rect(50, 480, 800, 100, 10);

    noStroke();
    fill(p.color);
    textAlign(LEFT, TOP);
    textSize(20);
    text(p.name + " (" + p.type + ")", 70, 500);

    fill(200);
    textSize(14);
    textStyle(ITALIC);
    text(p.full, 70, 525);

    textStyle(NORMAL);
    fill(255);
    text("Target: " + p.target, 70, 550);

    // Wrap text description
    text(p.desc, 400, 500, 430, 80);
}