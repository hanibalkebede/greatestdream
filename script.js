// p5.js demo implementing the requested scenes
let scene = 0;
const SCENES = {
    INTRO: 0,
    CONCERT: 1,
    PROFILE: 2,
    CLUB_SELECT: 3,
    SIGNING: 4,
    TRAINING: 5,
    MATCH: 6,
    CELEBRATION: 7
};

let startTime = 0;
let sceneTimer = 0;
let artists = ['Eminem — Not Afraid','Drake — God\'s Plan','Bruno Mars — Just the Way You Are','Chris Brown — Live'];
let currentArtist = 0;
let uiOverlay;
let profile = null;
let clubs = [];
let selectedClub = null;

// Match state
let match = {
    homeScore: 0,
    awayScore: 0,
    minutes: 0,
    matchLengthMinutes: 14,
    running: false,
    lastScorer: null,
    opponent: 'Wolves'
};

let weather = 'normal';
let fireworksParticles = [];

function setup(){
    createCanvas(windowWidth, windowHeight);
    uiOverlay = select('#ui-overlay');
    textFont('Arial');
    startSceneIntro();
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw(){
    background(20);
    switch(scene){
        case SCENES.INTRO: drawIntro(); break;
        case SCENES.CONCERT: drawConcert(); break;
        case SCENES.PROFILE: /* UI handles */ break;
        case SCENES.CLUB_SELECT: /* UI handles */ break;
        case SCENES.SIGNING: drawSigning(); break;
        case SCENES.TRAINING: drawTraining(); break;
        case SCENES.MATCH: drawMatch(); break;
        case SCENES.CELEBRATION: drawCelebration(); break;
    }
    drawFireworks();
}

function keyPressed(){
    if(key === ' '){
        advanceScene();
    }
}

function startSceneIntro(){
    scene = SCENES.INTRO;
    startTime = millis();
    sceneTimer = 0;
}

function drawIntro(){
    const t = (millis() - startTime) / 1000;
    sceneTimer = t;
    // stadium background and crowd
    drawStadium(t);

    // players walk out (simplified)
    fill(255);
    textSize(36);
    textAlign(CENTER);
    text('Players walking out of the tunnel — Manchester United vs Wolves', width/2, 80);

    // Bruno penalty moment at t>4
    if(t > 4 && t < 7){
        textSize(28); fill(255,230,0); text('Bruno Fernandes scores a penalty!', width/2, height/2);
        if(frameCount % 10 === 0) spawnFirework(random(width*0.3, width*0.7), random(height*0.2, height*0.6));
    }

    if(t > 8){
        textSize(26); fill(200,255,200); text('Manchester United wins the Champions League', width/2, height/2 + 60);
    }

    if(t > 10){
        // coach speech
        textSize(18); fill(255);
        text('Coach: Proud of every player. This is our moment!', width/2, height - 120);
    }

    // formation display and fans run
    if(t > 11){
        textSize(22); fill(255,200,0); text('Formation: 4-2-3-1', width/2, height - 80);
        // dynamic color shift
        let c = color(lerpColor(color('#1a3009'), color('#ffd700'), (sin(t*2)+1)/2));
        fill(red(c), green(c), blue(c), 80);
        rect(0,0,width, height);
    }

    // instruction
    if(t > 1){
        textSize(16); fill(220);
        text('Press SPACE to continue...', width/2, height - 30);
    }
}

function drawStadium(t){
    // grass
    noStroke();
    fill(30, 110, 40);
    rect(0, height*0.2, width, height*0.6);
    // crowd (simple dots)
    for(let i=0;i<200;i++){
        fill((i*13)%255, (i*31)%255, (i*7)%255, 180);
        let x = (i*37)%width;
        let y = random(height*0.02, height*0.18);
        ellipse(x, y, 5,5);
    }
}

function advanceScene(){
    if(scene === SCENES.INTRO){
        startConcert();
    } else if(scene === SCENES.CONCERT){
        startProfileForm();
    } else if(scene === SCENES.PROFILE){
        // form submit triggers next
    } else if(scene === SCENES.CLUB_SELECT){
        // club selection handled via UI
    } else if(scene === SCENES.SIGNING){
        startTraining();
    } else if(scene === SCENES.TRAINING){
        startMatch();
    } else if(scene === SCENES.MATCH){
        // space can be used to pause/resume
        match.running = !match.running;
    } else if(scene === SCENES.CELEBRATION){
        // restart demo
        resetDemo();
    }
}

function startConcert(){
    scene = SCENES.CONCERT;
    startTime = millis();
    currentArtist = 0;
}

function drawConcert(){
    const t = (millis() - startTime) / 1000;
    background(10,10,30);
    // stage
    fill(50); rect(width*0.1, height*0.5, width*0.8, height*0.35);
    fill(255); textSize(28); textAlign(CENTER);
    text('Stadium Concert', width/2, 80);

    // show current performer for short demo time (8s per artist)
    let index = floor(t / 8);
    if(index >= artists.length) index = artists.length - 1;
    currentArtist = index;
    textSize(22); fill(255,200,50); text(artists[currentArtist], width/2, height*0.6);

    // fireworks during performances
    if(frameCount % 6 === 0) spawnFirework(random(width*0.2, width*0.8), random(height*0.2, height*0.6));

    // camera flashes from fans
    if(frameCount % 12 === 0){
        fill(255,255,255, random(80,180)); rect(random(width*0.2,width*0.8), height*0.7, random(6,20), random(2,6));
    }

    // end of concert -> show message
    if(t > artists.length * 8 + 2){
        textSize(16); fill(220); text('Press SPACE to create player profile', width/2, height - 30);
    }
}

function startProfileForm(){
    scene = SCENES.PROFILE;
    uiOverlay.html('');
    const panel = createDiv().addClass('ui-panel center-top');
    panel.position((width/2)-220, 20);
    panel.style('width','440px');
    panel.html(`<h3>Create Player Profile</h3>`);
    // form fields
    const nameField = createInput('').attribute('placeholder','Name');
    const genderField = createSelect(); genderField.option('Male'); genderField.option('Female'); genderField.option('Other');
    const countryField = createInput('').attribute('placeholder','Country');
    const positionField = createSelect();
    ['ST','LW','RW','CAM','CM','LM','RM','CB','LB','RB'].forEach(p=>positionField.option(p));
    const submitBtn = createButton('Create').addClass('btn-ui');
    panel.child(nameField); panel.child(genderField); panel.child(countryField); panel.child(positionField); panel.child(submitBtn);
    submitBtn.mousePressed(()=>{
        const name = nameField.value().trim();
        const gender = genderField.value();
        const country = countryField.value().trim();
        const position = positionField.value();
        if(!name || !country){ alert('Please fill name and country'); return; }
        profile = { name, gender, country, position, shooting: floor(random(1,4)), passing: floor(random(1,3)), defense: floor(random(0,2)) };
        panel.remove();
        showClubSelection();
    });
}

function showClubSelection(){
    scene = SCENES.CLUB_SELECT;
    uiOverlay.html('');
    // generate 6 lower-ranked clubs across countries
    const sampleClubs = [
        {name:'Brighton Rovers', country:'England', coach:'M. Ellis', key:'A. King', stadium:'Seaview', formation:'4-2-3-1'},
        {name:'Valencia CF', country:'Spain', coach:'J. Ruiz', key:'M. Perez', stadium:'La Mar', formation:'4-3-3'},
        {name:'Lyonnais', country:'France', coach:'F. Morel', key:'L. Blanc', stadium:'Parc Est', formation:'4-2-3-1'},
        {name:'AZ Alkmaar', country:'Netherlands', coach:'P. van D', key:'R. Jans', stadium:'AFAS Park', formation:'4-4-2'},
        {name:'Bordeaux', country:'France', coach:'S. Martin', key:'G. Leroy', stadium:'Matmut', formation:'4-3-1-2'},
        {name:'Real Betis B', country:'Spain', coach:'C. Lopez', key:'D. Alvarez', stadium:'Nuevo', formation:'4-2-3-1'}
    ];
    clubs = sampleClubs;
    const panel = createDiv().addClass('ui-panel');
    panel.position(20, 60);
    panel.style('max-width','calc(100% - 40px)');
    panel.html(`<h3>Clubs Interested</h3><div id='clubs'></div><p>Select a club to sign</p>`);
    const container = select('#clubs');
    clubs.forEach((c,idx)=>{
        const card = createDiv().addClass('club-card');
        card.parent(container);
        card.html(`<strong>${c.name}</strong><div>${c.country} — Coach: ${c.coach}</div><div>Key: ${c.key}</div><div>Stadium: ${c.stadium}</div><div>Formation: ${c.formation}</div>`);
        const btn = createButton('Sign Here').addClass('btn-ui');
        btn.parent(card);
        btn.mousePressed(()=>{ selectedClub = c; panel.remove(); startSigning(); });
    });
}

function startSigning(){
    scene = SCENES.SIGNING;
    startTime = millis();
}

function drawSigning(){
    const t = (millis() - startTime)/1000;
    background(15,50,30);
    textSize(28); fill(255); textAlign(CENTER);
    text(`Welcome to ${selectedClub.name}`, width/2, 100);
    textSize(18); text(`${selectedClub.stadium} — Coach: ${selectedClub.coach}`, width/2, 140);
    if(t > 1){ textSize(16); fill(220); text('Photo session — Fans welcome you!', width/2, height/2); }
    if(t > 4){ text('Coach: We are excited to have you!', width/2, height/2 + 40); }
    if(t > 7){ text('Press SPACE to continue to training', width/2, height - 30); }
}

function startTraining(){
    scene = SCENES.TRAINING;
    startTime = millis();
    // training duration simulate 20 minutes compressed to 20 seconds
}

function drawTraining(){
    const t = (millis() - startTime)/1000;
    background(25,35,60);
    textSize(22); fill(255); textAlign(CENTER);
    text('Training Session — 20 minutes', width/2, 80);
    let progress = constrain(t/20, 0, 1);
    noStroke(); fill(100,200,100); rect(width*0.2, height/2 - 20, (width*0.6)*progress, 40);
    textSize(16); fill(220); text(`${floor(progress*100)}%`, width/2, height/2);
    if(progress >= 1){
        // improve player and advance
        profile.shooting = min(3, profile.shooting + 1);
        profile.passing = min(2, profile.passing + 1);
        startMatch();
    }
}

function startMatch(){
    scene = SCENES.MATCH;
    startTime = millis();
    match.minutes = 0;
    match.homeScore = 0; match.awayScore = 0;
    match.running = true;
    weather = random(['normal','rain','snow','sunny']);
}

function drawMatch(){
    // background adapts to weather
    if(weather === 'rain') background(40,70,100);
    else if(weather === 'snow') background(200,220,240);
    else if(weather === 'sunny') background(120,190,255);
    else background(20,60,30);

    // simple pitch
    fill(40,140,60); rect(width*0.05, height*0.15, width*0.9, height*0.7);

    // scoreboard top-right
    fill(0,0,0,160); rect(width - 300, 20, 280, 90, 8);
    fill(255); textSize(18); textAlign(LEFT);
    text(`${selectedClub.name} vs ${match.opponent}`, width - 280, 45);
    textSize(28); textAlign(CENTER);
    text(`${match.homeScore}  -  ${match.awayScore}`, width - 140, 75);

    // match clock: convert elapsed to in-game minutes
    const elapsed = (millis() - startTime)/1000; // seconds
    const secondsPerIngameMinute = 5; // speed: 5s == 1 in-game minute
    match.minutes = floor(elapsed / secondsPerIngameMinute);
    let displayMin = min(match.minutes, match.matchLengthMinutes);
    // football style display
    let display = `${displayMin}'`;
    fill(255,220,0); textSize(16); textAlign(LEFT);
    text(display, width - 80, 55);

    // Random events while running
    if(match.running && frameCount % 30 === 0){
        if(random() < 0.12){
            // an attempt
            if(random() < 0.45){
                // goal by random team
                const scorerIsUser = random() < 0.4; // 40% chance user gets involved
                if(scorerIsUser){ match.homeScore++; match.lastScorer = profile.name; spawnFirework(width/2, height/3); }
                else { match.awayScore++; match.lastScorer = match.opponent; }
                showGoalPopup(match.lastScorer, displayMin);
            }
        }
    }

    // end of match
    if(match.minutes >= match.matchLengthMinutes){
        match.running = false;
        // if user scored last and it's the winning goal
        if(match.homeScore > match.awayScore && match.lastScorer === profile.name){
            startCelebration(true);
        } else {
            startCelebration(false);
        }
    }
}

function showGoalPopup(scorer, minute){
    const panel = createDiv().addClass('ui-panel center-top');
    panel.position((width/2)-200, 20);
    panel.style('width','400px');
    panel.html(`<div style='font-size:18px;font-weight:bold;'>GOAL!</div><div>${scorer} (${minute}')</div>`);
    setTimeout(()=>panel.remove(), 3000);
}

function startCelebration(wonTrophy){
    scene = SCENES.CELEBRATION;
    startTime = millis();
    // if won trophy, big fireworks and cup
    if(wonTrophy){
        for(let i=0;i<80;i++) spawnFirework(random(width*0.2,width*0.8), random(height*0.1, height*0.6));
    } else {
        for(let i=0;i<30;i++) spawnFirework(random(width*0.2,width*0.8), random(height*0.1, height*0.6));
    }
    // adjust transfer interest and value
    if(wonTrophy){ profile.transferInterest = 0; profile.reputation = (profile.reputation||0) + 50; }
}

function drawCelebration(){
    const t = (millis() - startTime)/1000;
    background(10);
    textSize(32); fill(255,215,0); textAlign(CENTER);
    if(match.homeScore > match.awayScore){
        text(`${selectedClub.name} wins! Final: ${match.homeScore} - ${match.awayScore}`, width/2, 120);
        if(match.lastScorer === profile.name){
            textSize(22); text(`${profile.name} scored the winning goal!`, width/2, 160);
            drawCup();
        }
    } else {
        text(`${selectedClub.name} ${match.homeScore} - ${match.awayScore} ${match.opponent}`, width/2, 120);
    }
    if(t > 10){
        textSize(16); fill(220); text('Press SPACE to restart demo', width/2, height - 40);
    }
}

function drawCup(){
    push(); translate(width/2, height/2 + 40);
    fill(240,200,40); ellipse(0,30,220,120);
    rectMode(CENTER); rect(0,-20,120,140,20);
    fill(200,160,40); rect(-80,-20,20,100,8); rect(80,-20,20,100,8);
    fill(255); textAlign(CENTER); textSize(20); text('CHAMPIONS', 0, -40);
    pop();
}

// Fireworks system
function spawnFirework(x,y){
    const p = { x,y, particles: [] };
    for(let i=0;i<40;i++){
        p.particles.push({ x,y, vx: random(-3,3), vy: random(-4,1), life: random(40,120), col: [random(100,255), random(100,255), random(100,255)] });
    }
    fireworksParticles.push(p);
}

function drawFireworks(){
    for(let i = fireworksParticles.length-1;i>=0;i--){
        const pset = fireworksParticles[i];
        for(let j = pset.particles.length-1;j>=0;j--){
            const pr = pset.particles[j];
            pr.x += pr.vx; pr.y += pr.vy; pr.vy += 0.05; pr.life -= 1;
            noStroke(); fill(pr.col[0], pr.col[1], pr.col[2], map(pr.life,0,120,0,255)); ellipse(pr.x, pr.y, 4,4);
            if(pr.life <= 0) pset.particles.splice(j,1);
        }
        if(pset.particles.length === 0) fireworksParticles.splice(i,1);
    }
}

function resetDemo(){
    scene = SCENES.INTRO; profile = null; selectedClub = null; clubs = []; match = {homeScore:0,awayScore:0,minutes:0,matchLengthMinutes:14,running:false,opponent:'Wolves'}; uiOverlay.html(''); startSceneIntro();
}

