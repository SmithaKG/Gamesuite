window.onload = () => {
  const totalSteps = 15;
  let position = 0;
  let timeLeft = 120;
  let timer;

  const player = document.getElementById("player");
  const rollBtn = document.getElementById("rollBtn");
  const dice = document.getElementById("dice");
  const faces = document.querySelectorAll(".face");
  const timerDisplay = document.getElementById("timer");
  const result = document.getElementById("result");
  const track = document.querySelector(".track");
  const trackWidth = track.offsetWidth - 20; // minus player width
  const stepSize = trackWidth / totalSteps;

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }
  startTimer();

  function endGame() {
    clearInterval(timer);
    rollBtn.disabled = true;
    result.textContent = `⏰ Time’s up! Final Score = ${position}`;
  }

  function clearHighlights() {
    faces.forEach(f => f.classList.remove("highlight"));
  }

  function rollDice() {
    rollBtn.disabled = true;
    clearHighlights();

    const roll = Math.floor(Math.random() * 6) + 1;

    // random tumbling motion + controlled end-orientation
    const xSpin = 720 + (Math.random() * 360);
    const ySpin = 720 + (Math.random() * 360);
    dice.style.transform = `translateY(-30px) rotateX(${xSpin}deg) rotateY(${ySpin}deg)`;
    dice.animate(
      [
        { transform:`translateY(0)` },
        { transform:`translateY(-60px)` },
        { transform:`translateY(0)` }
      ],
      { duration:900, easing:"ease-out" }
    );

    setTimeout(() => {
      // orient so top face shows rolled value
      const orientations = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateY(180deg) rotateX(0deg)",
        3: "rotateY(-90deg) rotateX(0deg)",
        4: "rotateY(90deg) rotateX(0deg)",
        5: "rotateX(-90deg)",
        6: "rotateX(90deg)"
      };
      dice.style.transform = orientations[roll];
      faces[roll - 1].classList.add("highlight");

      // movement logic
      if (roll % 2 === 0 && position < totalSteps) position += 1;
      else if (roll % 2 === 1 && position > 0) position -= 1;

      player.style.left = position * stepSize + "px";

      result.textContent = `You rolled ${roll} → ${roll % 2 === 0 ? "forward +1" : "back −1"} | Position: ${position}/${totalSteps}`;

      rollBtn.disabled = false;
    }, 950);
  }

  rollBtn.addEventListener("click", rollDice);
};

