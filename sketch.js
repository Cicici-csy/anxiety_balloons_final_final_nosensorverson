let sentiment;
let inputBox, sentimentResult, conversation;
let totalConfidence = 0, inputCount = 0, maxInputs = 4;
let colorChosen = false, balloonColor = "", colorScore = 0;
let totalsensor = 0, count = 0;
let askForPort = false;

const serial = new p5.WebSerial();

function preload() {
  sentiment = ml5.sentiment("MovieReviews");
}

function setup() {
  noCanvas();
  console.log('hi')


  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
  }
  if (askForPort) makePortButton();
  else serial.getPorts()
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);


  inputBox = select("#userInput");
  sentimentResult = select("#feedback");
  conversation = select("#conversation");
  sentimentResult.html("Reflect on the question:\nWhat color reflects your inner state right now? \nPick the balloon of the corresponding color and place it on the tube");


  inputBox.elt.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSubmit();
  });
}

function handleSubmit() {
  let text = inputBox.value().trim();
  if (!colorChosen) {
    handleColorChoice(text);
  } else {
    getSentiment(text);
  }
}

function handleColorChoice(text) {
  const validColors = { red: 100, yellow: 75, blue: 50, green: 25 };
  if (validColors[text.toLowerCase()]) {
    balloonColor = text.toLowerCase();
    colorScore = validColors[balloonColor];
    colorChosen = true;
    conversation.html(conversation.html() + `> Chosen balloon color: ${balloonColor}\n`);
    sentimentResult.html("Now type your current thoughts below and enter.");
    inputBox.value("");
  } else {
    sentimentResult.html("Invalid color. Please choose from red, yellow, blue, or green.");
  }
}

function getSentiment(text) {
  if (inputCount < maxInputs) {
    conversation.html(conversation.html() + `> ${text}\n`);
    sentiment.predict(text, gotResult);
  }
}

function gotResult(prediction) {
  totalConfidence += prediction.confidence;
  inputCount++;

  if (inputCount >= maxInputs) {

    let averageConfidence = (1 - totalConfidence / maxInputs).toFixed(2);
    let sensorAverage = totalsensor / Number(count); 
    let finalScore = (Number(colorScore) * 0.3) + (Number(averageConfidence) * 100);
    console.log(totalsensor)
    console.log(count)
    console.log(averageConfidence)
    console.log(colorScore)
    console.log(sensorAverage)
    console.log(finalScore)
    


    
    text('Final Score:',finalScore,100,100);
    sentimentResult.html(
      `>>> Test report:<br>
      Final Score: ${finalScore.toFixed(2)}<br>`
    );


    if (finalScore < 25) {
      sentimentResult.html(sentimentResult.html() + "<br>> Emotion: Clear Skies <br>> Your Mood: Your mood feels like a sunny day—bright and carefree, with blue skies cheering you on. <br>> Suggested Action: Keep enjoying the sunshine in your heart! Maybe share your positivity with others.");
    } else if (finalScore >= 25 && finalScore < 50) {
      sentimentResult.html(sentimentResult.html() + "<br>> Emotion: Partly Cloudy <br>> Your Mood: Your mood feels like a partly cloudy day—still nice, but with a hint of uncertainty sneaking through. <br>> Suggested Action: Take a few deep breaths and let the clouds drift away. A little movement or music might clear the skies.");
    } else if (finalScore >= 50 && finalScore < 75) {
      sentimentResult.html(sentimentResult.html() + "<br>> Emotion: Stormy Skies <br>> Your Mood: It’s like the weather’s turning stormy—wind picking up, maybe a few drops of rain. You feel on edge, but it’s not a full-blown storm yet. <br>> Suggested Action: Pause and take shelter. Try a warm drink, calming words, or a short walk to ease the tension.");
    } else {
      sentimentResult.html(sentimentResult.html() + "<br>> Emotion: Thunderstorm <br>> Your Mood: Your emotions feel like a raging thunderstorm—heavy rain, booming thunder, and flashes of lightning. It’s intense, but storms do pass. <br>> Suggested Action: Find a cozy spot, let it out if you need to, and focus on grounding techniques. Journaling, talking to a loved one, or mindfulness can help calm the storm.");
    }

    inputBox.attribute("disabled", true);
  } else {
    sentimentResult.html("Keep typing!");
    inputBox.value("");
  }
}

function serialEvent() {
  let inString = serial.readStringUntil("\r\n");
  if (inString) {
    let sensorValue = Number(inString);
    totalsensor += sensorValue;  
    count++;
  }
}

function openPort() {
  serial.open();
  if (portButton) portButton.hide();
  console.log('port opened')
}

function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(() =>serial.requestPort());
}
