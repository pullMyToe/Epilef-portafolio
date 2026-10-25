(async function () {
  const $canvas = $("#canvas-one");
  const drawingData = (await $.ajax({
    type: "GET",
    url: `http://localhost:3000/get-drawings/632aee51ead3d48da6aa7eca/632aee50c7c7690004086512`,
  }))[0];

  console.log(drawingData);

  $canvas[0].width = drawingData.canvasSize.width;
  $canvas[0].height = drawingData.canvasSize.height;
  const context = $canvas[0].getContext("2d");
  context.lineCap = "round";
  let currentStroke = 0;

  for (let point of drawingData.strokeData) {
    setTimeout(() => {
      if (point.strokeNumber !== currentStroke) {
        context.beginPath();
        currentStroke++;
      }
      context.lineWidth = point.width;
      context.strokeStyle = point.color;
      context.lineTo(point.xPosition, point.yPosition);
      context.stroke();
    }, point.timeSinceGameStart)
  }

})();



