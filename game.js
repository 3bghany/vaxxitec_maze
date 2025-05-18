const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

let seconds = 0;
let score = 0;
let timerInterval;
let gameEnded = false;
let stopPlayer=false;
let player = { x: 680, y: 420, width: 20, height: 20 ,imageWidth: 45,imageHeight: 60}; // Player's start position
let playerImage = new Image();
playerImage.src = 'imgs/chickenv1.png'; // Replace with the path to your image
const coinImage = new Image();
coinImage.src = "imgs/hvt.webp";
let coinCounter=0;
let joyAvailable=true;

let coins = [
    { x: 30, y: 240, collected: false,answer:"true", message: "Vaxxitek rHVT-IBD-H5 COBRA can be used via IM injection" },
    { x: 420, y: 150, collected: false,answer:"false", message: "Vaccination using 2 Vaxxitek vaccines at the same time is correct" },
    { x: 70, y: 410, collected: false,answer:"true", message: "Vaxxitek rHVT-IBD-H5 COBRA is compatible with Gallimune ND-H9 at 1 day old" },
    { x: 40, y: 40, collected: false,answer:"false", message: "Vaccination with Vaxxitek rHVT-IBD-H5 COBRA can minimise or limit the reassortments of both H5 and IBD viruses over time" },
    { x: 680, y: 190, collected: false,answer:"true", message: "Indirect ELISA with Antigen coated plates is more better than other serological tests like AGPT for IBD or HI for H5 for monitoring of both IBD and H5" }
];

function collectCoin(playerX, playerY) {
    if (gameEnded) return; // Do nothing if the game has ended

    coins.forEach(coin => {
        if (!coin.collected &&
            playerX < coin.x + 20 && playerX + player.width+20 > coin.x &&
            playerY < coin.y + 20 && playerY + player.height+20 > coin.y) {
            coin.collected = true;
            showPopup(coin.message,coin.answer); // Show the message associated with the coin
            coinCounter++;
            drawPlayer(coinCounter);
        }
    });

    // Check if all coins are collected
    if (checkAllCoinsCollected()) {
        endGame();
    }
}

function checkAllCoinsCollected() {
    return coins.every(coin => coin.collected);
}

function endGame() {
    gameEnded = true; // Set the game as ended
    clearInterval(timerInterval); // Stop the timer

    // Calculate time taken in hh:mm:ss format
    let hours = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;
    const totalTime = `${hours}h ${mins}m ${secs}s`;

    // Prompt for player name
    const playerName = localStorage.getItem('username') || 'Guest';
    saveTime(playerName, totalTime);

 
    // Redirect after 5 seconds (duration of the popup)
    setTimeout(() => {
        window.location.href = "leaderboard.html"; // Change to your actual leaderboard page
    },5000);
}

async function saveTime(name, time) {

    const dataURL = 'https://reactionacademy.org/wp-json/stellar/v1/leaderboard';
    try {
        const response = await fetch(dataURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                time: time,
                totalSeconds: seconds
            })
        });

        if (response.ok) {

            const responseData = await response.json();
            console.log( responseData[0]);

            let player_data={id:responseData[1],name: name, time: time, totalSeconds: seconds };
            localStorage.setItem('player', JSON.stringify(player_data));

        } else {
            console.error('Failed to add data');
        }
    } catch (error) {
        console.error('Error adding leaderboard data:', error);
    }
}



function showPopup(message,answer) {
    let popup = document.createElement("div");
    popup.className = "my-popup";

    let btntrue = document.createElement("button");
    let btnfalse = document.createElement("button");

    btntrue.innerText = "true";
    btnfalse.innerText = "false";

    btntrue.classList.add('btn');
    btnfalse.classList.add('btn');

    
    popup.textContent = message; // Add message content
    // Append the popup to the body
    document.body.appendChild(popup);
       // Append buttons to the popup
    popup.appendChild(btntrue);
    popup.appendChild(btnfalse);
    // clearInterval(timerInterval); // Stop the timer
    stopPlayer=true;

    btntrue.addEventListener("click", () => {
        if(answer == "true") {
            btntrue.classList.add("correct")
            updateScore(10);
        } else{
            btntrue.classList.add("wrong");
            btnfalse.classList.add("correct");
        }
        closepopup(popup);
    });

    btnfalse.addEventListener("click", () => {
        if(answer == "false") {
            btnfalse.classList.add("correct")
            updateScore(10);
        } else{
            btnfalse.classList.add("wrong");
            btntrue.classList.add("correct");
        }
        closepopup(popup);
    });
    setJoystickState(false);

}
function closepopup(popup){
    // Remove popup after 3 seconds
    setTimeout(() => {
        document.body.removeChild(popup);
        if(!gameEnded){
            // timerInterval = setInterval(updateTimer, 1000);
            stopPlayer=false;
            setJoystickState(true);
        }
    }, 1000);
}

function updateTimer() {
    seconds++;
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

let walls = [
    // Outer boundary
    [0, 0, 740, 0], [0, 0, 0, 450], [740, 0, 740, 450], [0, 450, 740, 450],
    // Complex inner walls (adjust as needed)
    [0, 440, 720, 440], [0, 50, 0, 460], [0, 0, 720, 0], [720, 0, 720, 380],
    [460, 380, 460, 440], [120, 380, 120, 440], [590, 380, 720, 380], [590, 340, 590, 380],
    [550, 340, 550, 380], [380, 340, 380, 380], [180, 340, 180, 380], [60, 340, 60, 380],
    [180, 380, 380, 380], [120, 380,60, 380], [550, 340, 380, 340], [60, 340, 340, 340],
    [120, 300, 120, 340], [340, 300, 340, 340], [260, 300, 480, 300],
    [160, 280, 210, 280], [0, 280, 70, 280], [550, 250, 550, 300], [390, 250, 390, 300],
    [160, 250, 160, 280], [210, 130, 210, 280], [70, 180, 70, 280], [70, 250, 120, 250],
    [260, 250, 340, 250], [390, 250, 480, 250], [550, 250, 590, 250],
    [340, 180, 340, 250], [320, 180, 320, 180], [590, 130, 590, 280],
    [0, 130, 110, 130], [210, 130, 260, 130], [590, 130, 720, 130], [350, 130, 430, 130],
    [320, 180, 470, 180], [390, 130, 390, 130], [430, 80, 430, 130], [470, 80, 470, 180],
    [550, 130, 550, 180], [260, 130, 260, 250],[650, 180, 650, 320],[650, 230, 720, 230],
    [160, 130, 160, 180], [110, 130, 260, 130],
    [550, 130, 680, 130], [350, 80, 350, 130], 
    [0, 80, 80, 80], [160, 80, 260, 80], [430, 80, 550, 80], [590, 80, 720, 80], 
    [120, 80, 350, 80],  
    [160, 80, 160, 80], [390, 80, 390, 80], [550, 40, 550, 80]

];
function drawWalls() {
    ctx.strokeStyle = "#000"; // Set color for walls
    ctx.lineWidth = 3; // Wall thickness
    walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(wall[0], wall[1]);
        ctx.lineTo(wall[2], wall[3]);
        ctx.stroke();
    });
}

function drawPlayer(coinCounter) {
    ctx.zIndex="500";
    if(coinCounter < 2){
        ctx.drawImage(playerImage, player.x - 15, player.y-50, player.imageWidth+10, player.imageHeight+10);
    }else if(coinCounter < 4){
        playerImage.src = 'imgs/chickenv2.png';
        ctx.drawImage(playerImage, player.x-25, player.y-40, player.imageWidth+30, player.imageHeight);
    }else{
        playerImage.src = 'imgs/chickenv3.png';
        ctx.drawImage(playerImage, player.x-30, player.y-50, player.imageWidth+35, player.imageHeight+10);
    }
}

let time = 0;

function drawCoins() {
    time += 0.1; // Time for animation

    coins.forEach((coin, index) => {
        if (!coin.collected) {
            // Bounce effect
            const bounce = Math.sin(time + index) * 5; // Slight bounce

            // Brighter border (glow effect)
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#732579"; // Bright yellow glow
            ctx.drawImage(coinImage, coin.x - 35, coin.y - 25 + bounce, 80, 60);
            ctx.restore();

            // Optional: draw a circular border
            ctx.beginPath();
            ctx.arc(coin.x + 5, coin.y + bounce, 30, 0, Math.PI * 2);
            ctx.strokeStyle = "#732579"; // Bright stroke
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function movePlayer(event) {
    const speed = 10;
    let nextX = player.x;
    let nextY = player.y;
    let isArrowClicked=true;

    switch (event.key) {
        case 'ArrowUp':
            nextY -= speed;
            break;
        case 'ArrowDown':
            nextY += speed;
            break;
        case 'ArrowLeft':
            nextX -= speed;
            break;
        case 'ArrowRight':
            nextX += speed;
            break;
        default :
            isArrowClicked=false;
        break ;
    }

    // Prevent movement if colliding with walls
    if (!isCollidingWithWalls(nextX, nextY, player.width, player.height) && isArrowClicked && !stopPlayer) {
        player.x = nextX;
        player.y = nextY;
        // Start timer on the first movement
        startTimer();
    }

    // Check for coin collection after moving
    collectCoin(player.x, player.y);
}


// Simplified collision check with the walls
function isCollidingWithWalls(nextX, nextY, width, height) {
    for (let wall of walls) {
        const [x1, y1, x2, y2] = wall;

        // Ensure the wall coordinates are correctly interpreted regardless of their order
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        // Horizontal wall collision check
        if (y1 === y2) {
            if (nextY + height > minY && nextY < minY &&
                ((nextX + width > minX && nextX < maxX) || (nextX > minX && nextX < maxX))) {
                return true;
            }
        }

        // Vertical wall collision check
        if (x1 === x2) {
            if (nextX + width > minX && nextX < minX &&
                ((nextY + height > minY && nextY < maxY) || (nextY > minY && nextY < maxY))) {
                return true;
            }
        }
    }
    return false;
}
// Create a variable to control joystick visibility and functionality
let joystickEnabled = true; // Set this to false to disable the joystick

// Create Virtual Joystick instance
let joy;

// Function to initialize the joystick
function initializeJoystick() {
    if (!joystickEnabled) return; // Don't initialize if disabled
    
    // console.log("Initializing joystick...");
    joy = new VirtualJoystick({
        container: document.body, // Joystick appears on the screen
        mouseSupport: true,       // Enable mouse support for joystick
        limitStickTravel: true,   // Restrict stick movement to radius
        stickRadius: 100          // Radius of joystick control
    });
}

// Function to destroy the joystick
function destroyJoystick() {
    if (joy) {
        joy.destroy();
        joy = null;
    }
}

// Function to toggle joystick state
function setJoystickState(enabled) {
    joystickEnabled = enabled;
    
    if (enabled) {
        initializeJoystick();
        joyAvailable=true;
    } else {
        destroyJoystick();
        joyAvailable=false;
    }
}
// Wait for the DOM to load before initializing the joystick
document.addEventListener("DOMContentLoaded", () => {
    // Only initialize if enabled
    if (joystickEnabled) {
        initializeJoystick();
    }
}, { passive: false });

// Adjust the player's movement based on joystick input
function handleJoystickMovement() {
    if (!joy || typeof joy.deltaX !== 'function' || typeof joy.deltaY !== 'function') {
        console.error("Joystick instance not initialized or unavailable.");
        return;
    }

    const dx = joy.deltaX(); // Horizontal joystick movement
    const dy = joy.deltaY(); // Vertical joystick movement

    // Normalize movement to maintain consistent speed
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
        const normalizedX = (dx / magnitude) * 2; // Adjust speed factor as needed
        const normalizedY = (dy / magnitude) * 2;

        let nextX = player.x + normalizedX;
        let nextY = player.y + normalizedY;

        // Handle collisions separately for each axis
        if (!isCollidingWithWalls(nextX, player.y, player.width, player.height) && !stopPlayer) {
            player.x = nextX; // Allow movement along X-axis
        }
        if (!isCollidingWithWalls(player.x, nextY, player.width, player.height) && !stopPlayer) {
            player.y = nextY; // Allow movement along Y-axis
        }

        startTimer(); // Start the timer on movement
    }

    // Check for coin collection
    collectCoin(player.x, player.y);
}




// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawWalls();
    drawCoins();
    drawPlayer(coinCounter);
    if(joyAvailable){
        handleJoystickMovement();
    }
    requestAnimationFrame(gameLoop);
}

// Initialize game
gameLoop();

// Start timer when player moves
window.addEventListener('keydown', movePlayer);

// Example data after the maze is completed
function onGameCompleted() {
    const playerName = localStorage.getItem('username') || 'Guest';
    const timeTaken = calculateTimeTaken(); // Your method for calculating time

    // Retrieve leaderboard data from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Add current player's time
    leaderboard.push({ name: playerName, time: timeTaken });

    // Sort leaderboard by time (ascending order)
    leaderboard.sort((a, b) => a.time - b.time);

    // Save the updated leaderboard to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Redirect to the leaderboard page
    window.location.href = 'leaderboard.html';
}

function calculateTimeTaken() {
    // Implement the logic to calculate the time taken by the player
    return 42; // Example: return time in seconds
}

document.getElementById('playerName').textContent = localStorage.getItem('username') || 'Guest';