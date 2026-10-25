// TODO: update rubber functionality (canvas clearRect?)
// TODO: make width slider also return to previous value when disabling rubber
// IIFE for adding membership info to session data
(async function () {
  const membershipInfo = await MemberStack.onReady;
  sessionData.userInfo = {
    webflowID: membershipInfo["webflow-member-id"],
    memberstackID: membershipInfo["id"]
  };
})();

const dummyPrompts = [["An ogre", "A giant", "An elf"], ["An angel", "A demon", "A ghost"], ["A naughty child", "A good child", "An excited child"]];

// Create session data object to store all data points of interest
let sessionData = {
  userInfo: {},
  promptData: [],
  strokeData: [],
  UTCDate: (new Date()).toISOString(),
  userUTCOffset: (new Date()).getTimezoneOffset(),
  canvasSize: {
    width: 0,
    height: 0
  }
};

// Set default values for painting parameters;
let paintingParameters = {
  painting: false,
  erasing: false,
  eraserSelected: false,
  valsBeforeErasing: {
    strokeStyle: "black",
    lineWidth: 16
  },
  strokeNumber: 0
};

// Select required DOM elements
const $canvasWrap = $("#canvas-wrap");
const $canvas = $("#canvas");
const $canvasOverlay = $("#canvas-overlay");
const $widthSlider = $("#width-slider");
const $colorPicker = $("#color-picker");
const $colorPen = $("#color-pen");
const $eraserButton = $("#eraser-button");
const $submitCountdownContainer = $("#submit-countdown-container");
const $countdownContainer = $("#countdown");
const $countdownNumberContainer = $("#countdown-number");
const $promptsAndSkipContainer = $("#prompts-and-skip-container");
const $prompts = $("#prompts");

// // Causes issues with drawing - TODO: return to diagnose
// $canvas.width($(window).width() * 0.9);
// $canvas.height($(window).height() * 0.9);

const desktopMediaMatcher = window.matchMedia("only screen and (min-width: 980px)");
const tabletMediaMatcher = window.matchMedia("only screen and (max-width: 979px)");
const mobileMediaMatcher = window.matchMedia("only screen and (max-width: 500px)");

if (mobileMediaMatcher.matches) {
  $canvas[0].width = sessionData.canvasSize.width = window.innerWidth;
  $canvas[0].height = window.innerHeight * 0.8;
}
else if (tabletMediaMatcher.matches) {
  $canvas[0].width = sessionData.canvasSize.width = window.innerWidth * 0.9;
  $canvas[0].height = window.innerHeight * 0.8;
}
else {
  $canvas[0].width = sessionData.canvasSize.width = window.innerWidth * 0.9;
  $canvas[0].height = window.innerHeight * 0.8;
}

sessionData.canvasSize.height = $canvas[0].height - $canvasOverlay.height();

// Initialize element dimensions
$canvasOverlay.css("width", $canvas[0].width);
$widthSlider.css({"width": window.innerWidth * 0.15});

$prompts.css("max-width", $canvas[0].width);
// $canvas[0].width = $canvasWrap.width();
// $canvas[0].height = $canvasWrap.height();

 // // Resizing doesn't make much sense in this context
  // const resizeHandler = function (currentLineWidth, currentStrokeStyle, currentLineCap) {
  //   $canvas[0].width = window.innerWidth * 0.9;
  //   $canvas[0].height = window.innerHeight * 0.9;
  //   context.lineWidth = currentLineWidth;
  //   context.strokeStyle = currentStrokeStyle;
  //   context.lineCap = currentLineCap;
  // }

  // window.addEventListener("resize", () => {
  //   resizeHandler(context.lineWidth, context.strokeStyle, context.lineCap);
  // });


// Initialize element positions
$canvasOverlay.css({position: "absolute", bottom: 3});
$promptsAndSkipContainer.css({position: "absolute", top: window.innerHeight * 0.3});

// Get context from canvas API and set default values
const context = $canvas[0].getContext("2d");
context.lineWidth = 16;
context.strokeStyle = "black";
context.lineCap = "round";


// Create functions for toggling painting / erasing
const startPosition = function () {
  if (paintingParameters.eraserSelected) {
    paintingParameters.erasing = true;
  }
  else {
    paintingParameters.painting = true;
  }
  paintingParameters.strokeNumber++;
};

const endPosition = function () {
  if (paintingParameters.erasing) {
    paintingParameters.erasing = false;
  }
  else {
    paintingParameters.painting = false;
  }
  context.beginPath();
};

const drawLine = function (event, gameStartTime) {
  if (paintingParameters.erasing) {
    if (context.strokeStyle !== "white") context.strokeStyle === "white";
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
    sessionData.strokeData.push({xPosition: event.offsetX, yPosition: event.offsetY, color: context.strokeStyle, width: context.lineWidth, timeSinceGameStart: Date.now() - gameStartTime, strokeNumber: paintingParameters.strokeNumber, eraser: true});
    // console.log(sessionData);
  }
  else if (paintingParameters.painting) {
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
    console.log(event.offsetX, event.offsetY);
    sessionData.strokeData.push({xPosition: event.offsetX, yPosition: event.offsetY, color: context.strokeStyle, width: context.lineWidth, timeSinceGameStart: Date.now() - gameStartTime, strokeNumber: paintingParameters.strokeNumber, eraser: false});
    // console.log("1", sessionData.canvasSize.width, sessionData.canvasSize.height);
    // console.log("2:", event.offsetX, event.offsetY);
    console.log(sessionData);
  };
};

const addTouchEventOffset = function (event) {
  const rect = event.target.getBoundingClientRect();
  event.targetTouches[0].offsetX = event.targetTouches[0].pageX - rect.left - window.scrollX;
  event.targetTouches[0].offsetY = event.targetTouches[0].pageY - rect.top - window.scrollY;
};

const touchStartPosition = function (event) { startPosition() };
const touchEndPosition = function (event) { endPosition() };
const touchDrawLine = function (event, gameStartTime) {
  drawLine(event.targetTouches[0], gameStartTime);
  event.preventDefault();
};

const addCanvasPaintEvents = function (gameStartTime) {
  $canvas.mousedown((event) => {
    startPosition();
    drawLine(event, gameStartTime);
  });
  $canvas.mouseup(endPosition);
  $canvas.mouseleave(endPosition);
  $canvas.mousemove((event) => drawLine(event, gameStartTime));

  $canvas.on("touchstart", (event) => {
    addTouchEventOffset(event);
    touchStartPosition();
    touchDrawLine(event, gameStartTime);
  });
  $canvas.on("touchend", touchEndPosition);
  // $canvas.mouseleave(endPosition);
  $canvas.on("touchmove", (event) => {
    addTouchEventOffset(event);
    const touch = event.touches[0];
    if ($canvas[0] !== document.elementFromPoint(touch.pageX - window.scrollX, touch.pageY - window.scrollY)) {
      touchEndPosition();
      return;
    }
    touchDrawLine(event, gameStartTime);
  });
};

const removeCanvasEvents = function () {
  $canvas.unbind();
}

// Create events for changing stroke parameters with user input
$widthSlider.change(function () {
  context.lineWidth = $(this).val();
});
$colorPicker.change(function () {
  context.strokeStyle = $(this).val();
  console.log($(this).val())
  $(".colorPen").css("fill", $(this).val());
});
$widthSlider.change(function () {
  context.lineWidth = $(this).val();
  console.log($(this).val())
});
$eraserButton.click(() => {
  if (paintingParameters.eraserSelected) {
    context.strokeStyle = paintingParameters.valsBeforeErasing.strokeStyle;
    context.lineWidth = paintingParameters.valsBeforeErasing.lineWidth;
    paintingParameters.eraserSelected = false;
    $eraserButton.prop("id", "eraser-button");
  }
  else {
    const { strokeStyle, lineWidth } = context;
    paintingParameters.valsBeforeErasing.strokeStyle = strokeStyle;
    paintingParameters.valsBeforeErasing.lineWidth = lineWidth;
    paintingParameters.eraserSelected = true;
    context.strokeStyle = "white";
    $eraserButton.prop("id", "eraser-button-selected");
  };
});

// Create function for presenting prompts
const showPrompts = function (prompts) {
  // Add prompts to DOM
  $prompts.html("");
  for (let prompt of prompts) {
    $prompts.append(`<button type='button' class='prompt'>${prompt}</button>`);
  };
  // Get time at which prompts were shown
  const promptsShowTime = Date.now();
  // Add skip button on first invocation of this function
  if (!$("#skip-button").length) {
    $promptsAndSkipContainer.append("<button id='skip-button'><i class='fa fa-fast-forward purple-icon' style='font-size:100px;'></button>");
  }

  // Create prompt click handler
  $(".prompt").click(function () {
    const promptsSelectedTime = Date.now();
    sessionData.promptData.push({prompts, displayTime: promptsSelectedTime - promptsShowTime, selected: true, selectedPrompt: $(this).text()});
    $prompts.html("");
    $promptsAndSkipContainer.find("i").remove();
    console.log(sessionData);
    beginDrawing();
  });

  // Create skip button click handler
  $("#skip-button").click(() => {
    const promptsSelectedTime = Date.now();
    sessionData.promptData.push({prompts, displayTime: promptsSelectedTime - promptsShowTime, selected: false, selectedPrompt: null});
    $("#skip-button").unbind();
    prompts = dummyPrompts[Math.floor(Math.random() * 3)];
    showPrompts(prompts);
    console.log(sessionData);
  });
};

const beginDrawing = function () {
  const gameStartTime = Date.now();
  addCanvasPaintEvents(gameStartTime);

  $submitCountdownContainer.prepend(
    `<button type='button' id="submit-early">Submit</button>`
  );
  startCountdown();
};

const startCountdown = function () {
  $countdownContainer.append(
    `<svg>
      <circle r='18' cx='20' cy='20'></circle>
    </svg>`
  );
  let countdownFrom = 60;
  $countdownNumberContainer.text(countdownFrom);
  const countdownInterval = setInterval(function() {
    countdownFrom = --countdownFrom <= 0 ? 0: countdownFrom;
    $countdownNumberContainer.text(countdownFrom);
  }, 1000);

  const cancelCounterTimeout = setTimeout(() => {
    clearInterval(countdownInterval);
    $("#submit-early").unbind();
    const dashOffset = $("svg circle").css("stroke-dashoffset");
    $("svg circle").css({animation: "none", "stroke-dashoffset": dashOffset});
    handleGameEnd();
  }, 60000);

  $("#submit-early").click(() => {
    clearTimeout(cancelCounterTimeout);
    clearInterval(countdownInterval);
    const dashOffset = $("svg circle").css("stroke-dashoffset");
    $("svg circle").css({animation: "none", "stroke-dashoffset": dashOffset});
    handleGameEnd();
  });
};

const handleGameEnd = function () {
  $canvas.unbind();
  // $eraserButton.unbind();
  // console.log(sessionData);

  $.ajax({
    type: "POST",
    url: "https://kanjo-web-app.herokuapp.com/add-drawing-data",
    // url: "http://localhost:3000/add-drawing-data",
    data: JSON.stringify(sessionData),
    contentType: "application/json",
  });

  sessionData = {
    userInfo: sessionData.userInfo,
    promptData: [],
    strokeData: [],
    UTCDate: (new Date()).toISOString(),
    userUTCOffset: (new Date()).getTimezoneOffset(),
    canvasSize: {
      width: sessionData.canvasSize.width,
      height: sessionData.canvasSize.height
    }
  };

  paintingParameters = {
    painting: false,
    strokeNumber: 0
  };

  context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);
  $("#submit-early").remove();
  $prompts.append(
    `<button type='button' id='play-again' class='prompt'>Play again?</button>`
  );
  $("#play-again").click(startNewRound);

};

const startNewRound = function () {
  showPrompts(dummyPrompts[Math.floor(Math.random() * 3)]);
};

startNewRound();




