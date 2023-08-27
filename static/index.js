// Box width
var bw = 400;
// Box height
var bh = 400;
// Padding
var p = 10;
var topTenRecs = [];

var RowForSearch = 0;
var ColForSearch = 0;


var state = getState(zipCode);
console.log(state);
var input_colors = input_colors.map(value => value === 1);
var soilTypes = soilTypes.map(value => value === 1);
var plotSelect = true;
var groundSelect = false;
var plantSelect = false;
var maxHeight = parseInt(maxHeight);
var rise = true;

var drID = 0;
var startID = Number.MAX_VALUE;

var plantArray = [];
//make array to store values of plants 

//!!!!!!!!remember that I switched these
const userwidth = parseInt(length);
const userlength = parseInt(width);
const rows = userwidth;
const cols = userlength;

//-2 = usable and empty
//-1 = unusable grid space

//0 = unused
//1 = gc
//2 = plant

for (let i = 0; i < userwidth; i++) {
  var row = [];
  for (let j = 0; j < userlength; j++) {
    let plant = {
      plantID: -2,
      driftID: -1,
      state: 0,
    };
    row.push(plant);
  }
  plantArray.push(row);
}

var box = 20; 

var startingx = 50;
var startingy = 0;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  updateLegend();
  //createSlide();
  var centerX = canvas.width / 2 - bw / 2;
  startingx = 10;
  startingy = 10;
 for (let i = 0; i < userwidth; i++) {
    for (let j = 0; j < userlength; j++) {  
      var drift = plantArray[i][j].driftID;
      if (drift > -1 && plantArray[i][j].state == 1) {      
        if (drift % 4 == 0) {
          context.fillStyle = "palegreen";
        } else if (drift % 4 == 1) {
          context.fillStyle = "green";
        } else if (drift % 4 == 2) {
          context.fillStyle = "lime";
        } else {
          context.fillStyle = "darkseagreen";
        }
        context.fillRect(startingx+j*box, startingy+i*box, box, box);
      } else if (plantArray[i][j].state == 2 && plantArray[i][j].plantID == -2) { 
        context.fillStyle = "lightgray";
        context.fillRect(startingx+j*box, startingy+i*box, box, box); 
      } else if (plantArray[i][j].state == 2) {
        if ([177,180,199,201,202,206,211,217].includes(plantArray[i][j].plantID)) {
          context.fillStyle = "lightgreen";
          context.fillRect(startingx+j*box, startingy+i*box, box, box);  
        }
        const img = new Image();
        // Set the source of the image (replace 'path/to/image.jpg' with your image URL)
        let url = 'https://storage.googleapis.com/myhomepark-images/' + plantArray[i][j].plantID.toString() + '.png';
        console.log(url);
        img.src = url;
        // Once the image is loaded, draw it on the canvas
        img.onload = () => {
          context.drawImage(img, startingx+j*box, startingy+i*box, box, box);
        };
        // Set the properties of the circle
	const centerX = startingx+j*box+box/2; // X-coordinate of the center
	const centerY = startingy+i*box+box/2; // Y-coordinate of the center
	const radius = box/2;   // Radius of the circle
	const lineWidth = 2; // Width of the circle outline

	// Begin the drawing path
	context.beginPath();

	// Draw the circle outline
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI);

	// Set the line width and color for the outline
	context.lineWidth = lineWidth;
	context.strokeStyle = 'black'; // Set the outline color here

	// Stroke the path to actually draw the circle outline
	context.stroke();

	// End the drawing path
	context.closePath();
        context.lineWidth = 1;

        //ADD IN A BLACK RING AROUND THE PLANTS
        //context.fillStyle = "pink";
        //context.fillRect(startingx+j*box, startingy+i*box, box, box); 
      } else if (plantArray[i][j].plantID != -1) {
        context.strokeRect(startingx+j*box, startingy+i*box, box, box); 
      } else {
        context.fillStyle = "black";
        context.fillRect(startingx+j*box, startingy+i*box, box, box); 
      }
    }
  }
}

function drawRectangle(event) {
  var userx = event.clientX-20;
  var usery = event.clientY-20;
  var arr_row = Math.floor(usery / box);
  var arr_col = Math.floor(userx / box);
  RowForSearch = arr_row;
  ColForSearch = arr_col;
  if (plotSelect) {
    eliminateSquares(event);
  } else if (groundSelect && plantArray[arr_row][arr_col].driftID >= 0){
    showPopup(arr_row, arr_col, event);
  } else if (groundSelect) {
    groundDrift(event);
  } else if (plantSelect && plantArray[arr_row][arr_col].plantID >= 0){
    showPopup(arr_row, arr_col, event);
  } else {
    plantDrift(event);
  }
}

function plantDrift(event) {
  var userx = event.clientX-20;
  var usery = event.clientY-20;
  var arr_row = Math.floor(usery / box);
  var arr_col = Math.floor(userx / box);
  plantArray[arr_row][arr_col].driftID = drID;
  plantArray[arr_row][arr_col].state = 2;
  drawBoard();
}

function groundDrift(event) {
  var userx = event.clientX-20;
  var usery = event.clientY-20;
  var arr_row = Math.floor(usery / box);
  var arr_col = Math.floor(userx / box);
  plantArray[arr_row][arr_col].driftID = drID;
  plantArray[arr_row][arr_col].state = 1;
  drawBoard();
}

function eliminateSquares(event) {
  var userx = event.clientX-20;
  var usery = event.clientY-20;
  var arr_row = Math.floor(usery / box);
  var arr_col = Math.floor(userx / box);
  if (plantArray[arr_row][arr_col].plantID == -1) {
    plantArray[arr_row][arr_col].plantID = -2;
    plantArray[arr_row][arr_col].state = 0;

  } else {
    plantArray[arr_row][arr_col].plantID = -1;
    plantArray[arr_row][arr_col].state = 0;
  }
  drawBoard();
}

function reset() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  plantArray = [];
  for (let i = 0; i < userwidth; i++) {
    var row = [];
    for (let j = 0; j < userlength; j++) {
      let plant = {
        plantID: -2,
        driftID: -1,
        state: 0,
      };
      row.push(plant);
    }
    plantArray.push(row);
  }
  drawBoard();
}

function lock() {
  if (plotSelect) {
    plotSelect = false;
    groundSelect = true;
  } else if (groundSelect) {
    groundSelect = false;
    plantSelect = true;
    startID = drID;
    drID = drID + 1;
  }
}

function newDrift() {
  drID = drID + 1;
  if (plantSelect) {
    //implement query right here
    var avg = 0;
    var num = 0;
    var heightSuggestion = 0;
    for (let i = 0; i < userwidth; i++) {
       for (let j = 0; j < userlength; j++) {
          if (plantArray[i][j].driftID == drID - 1) {
             avg += j + 1;
             num += 1;
          }
       }
    }
    avg /= num;

    if (rise) {
       console.log(userlength);
       console.log(userlength/3);
       if (avg <= userlength/3) {
          heightSuggestion = 24;
       } else {
          heightSuggestion = 24 + (maxHeight-24) * (avg/userlength)        
       }
       console.log(heightSuggestion);
    }
    
    //implement the else

    fetch('/query_database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        colors: input_colors,
        color_names: [
          "purple", "red", "blue", "green", "white", "lavender", "yellow", "pink", "violet", "orange", "cream", "fusia"
        ],
        sunlevel: sunlevel, // Replace 'SOME_VALUE' with the actual value
        maxHeight: heightSuggestion, // Replace 'SOME_VALUE' with the actual value
        soilTypes: soilTypes,
        state: state
      })
    })
    .then(response => response.json())
    .then(data => {
      // Do something with the data returned from the server, e.g., update the UI
      console.log("Here is the data")
      topTenRecs[drID-1] = data.plants;
      console.log(topTenRecs);
      //console.log(data.plants);
      //console.log(typeof data.plants);
      //console.log(data.plants[0]);
      //console.log(data.plants[0].id);
      var num = Math.floor(Math.random() * 3);
      for (let i = 0; i < userwidth; i++) {
         for (let j = 0; j < userlength; j++) {
            if (plantArray[i][j].driftID == drID-1) {
               //error here
               plantArray[i][j].plantID = parseInt(data.plants[num].id);
               //plantArray[i][j].plantID = 10; 
            }
         }
      }
      printArray(plantArray);
      drawBoard(); // added to update the UI MTF
    })
    .catch(error => console.error('Error:', error));
  }

    /*
    IDtoSet = 3;
    for (let i = 0; i < userwidth; i++) {     
      for (let j = 0; j < userlength; j++) {
        if (plantArray[i][j].driftID == drID - 1) {
          plantArray[i][j].plantID = IDtoSet;
      }
    }
    */
  }
  updateLegend(); // trying to update the legend MTF
}


function printArray(array) {
  for (let i = 0; i < userwidth; i++) {
    str = ""
    for (let j = 0; j < userlength; j++) {
      str += plantArray[i][j].driftId + " ";
    }
    console.log(str);
  }
}

function plot() {
  plotSelect = true;
  groundSelect = false;
  plantSelect = false;
  drID++;
}

function ground() {
  plotSelect = false;
  groundSelect = true;
  plantSelect = false;
  drID++;
}

function plant() {
  plotSelect = false;
  groundSelect = false;
  plantSelect = true;
  drID++;
}




let popupVisible = false;
let clickedPlantRow = -1;
let clickedPlantCol = -1;

let yourPlantArray = []
  /*{
    "plantID": 0,
    "name": "sunflower",
    "color": "yellow",
    "height": "30",
    "soilType": "Clay",
  },
  {
    "plantID": 1,
    "name": "rose",
    "color": "red",
    "height": "20",
    "soilType": "Sand",
  }*/

let gcArray = [
  {
    "plantID": 177,
    "name": "Bottlebrush Grass",
    "color": "Green, Cream",
    "height": "60",
    "soilType": "Sand, Loam",
  },
    {
    "plantID": 180,
    "name": "Canada Wild Rye",
    "color": "Green",
    "height": "60",
    "soilType": "Sand, Loam, Clay",
  },
  {
    "plantID": 199,
    "name": "June Grass",
    "color": "Green, Cream",
    "height": "24",
    "soilType": "Gravel, Sand, Loam, Clay",
  },
  {
    "plantID": 201,
    "name": "Little Bluestem",
    "color": "Green, Blue, Red",
    "height": "36",
    "soilType": "Sand, Loam",
  },
  {
    "plantID": 202,
    "name": "Long-Beaked Sedge",
    "color": "Green",
    "height": "36",
    "soilType": "Sand, Loam, Clay",
  },
  {
    "plantID": 206,
    "name": "Plains Oval Sedge",
    "color": "Green",
    "height": "24",
    "soilType": "Sand, Loam, Clay",
  },
  {
    "plantID": 211,
    "name": "Prairie Sedge",
    "color": "Green",
    "height": "36",
    "soilType": "Sand, Loam, Clay",
  },
  {
    "plantID": 217,
    "name": "Sideoats Grama",
    "color": "Green, Lavender",
    "height": "36",
    "soilType": "Sand, Loam",
  },
]


//CHANGE SO THAT IT UPDATES WHEN THE NEXT DRIFT BUTTON IS CLICKED

function showPopup(row, col, event) {
  clickedPlantRow = row;
  clickedPlantCol = col;
  clickedDriftID = plantArray[clickedPlantRow][clickedPlantCol].driftID;

  const popup = document.getElementById("plantIdPopup");
  const plantOptionsDiv = document.getElementById("plantOptions");
  
  // Clear any existing plant options
  plantOptionsDiv.innerHTML = "";

  if (plantSelect) { 
     for (let i = 0; i < topTenRecs[clickedDriftID].length; i++) {
        let plant = {
           "plantID": topTenRecs[clickedDriftID][i].id,
           "name": topTenRecs[clickedDriftID][i].data.commonnamex,
           "color": topTenRecs[clickedDriftID][i].data.color,
           "height": topTenRecs[clickedDriftID][i].data.hmax,
        }
        console.log(plant);
        yourPlantArray.push(plant);
     }

    for (const plant of yourPlantArray) {
      const plantOption = document.createElement("div");
      plantOption.classList.add("plant-option");
      plantOption.setAttribute("data-plant-id", plant.plantID); // Set the plant ID
      
      const plantInfo = `Name: ${plant.name}, Color: ${plant.color}, Height: ${plant.height}`;


      plantOption.textContent = plantInfo; // Set the plant name or other relevant data
      plantOptionsDiv.appendChild(plantOption);
    }
  } else if (groundSelect) {
    console.log(groundSelect);
    for (const plant of gcArray) {
      const plantOption = document.createElement("div");
      plantOption.classList.add("plant-option");
      plantOption.setAttribute("data-plant-id", plant.plantID); // Set the plant ID
      
      const plantInfo = `Name: ${plant.name}, Color: ${plant.color}, Max Height: ${plant.height}, Soil Type: ${plant.soilType}`;


      plantOption.textContent = plantInfo; // Set the plant name or other relevant data
      plantOptionsDiv.appendChild(plantOption);
    }
  }
  

  // Calculate the position of the popup based on the clicked coordinates
  const userx = event.clientX - 20;
  const usery = event.clientY - 20;
  const popupWidth = popup.clientWidth;
  const popupHeight = popup.clientHeight;

  const maxX = window.innerWidth - popupWidth;
  const maxY = window.innerHeight - popupHeight;

  // Calculate the adjusted position for the popup
  const adjustedPopupLeft = Math.min(userx, maxX);
  const adjustedPopupTop = Math.max(Math.min(usery - popupHeight, maxY), 0);

  popup.style.left = adjustedPopupLeft + "px";
  popup.style.top = adjustedPopupTop + "px";

  popup.style.display = "block";
  popupVisible = true;
}

// Event listener for plant options
document.getElementById("plantOptions").addEventListener("click", function (event) {
  const target = event.target;
  if (target.classList.contains("plant-option")) {
    const newPlantId = parseInt(target.getAttribute("data-plant-id"));
    for (let i = 0; i < userwidth; i++) {
      for (let j = 0; j < userlength; j++) {
        if (plantArray[i][j].driftID === plantArray[clickedPlantRow][clickedPlantCol].driftID) {
          plantArray[i][j].plantID = newPlantId;
          plantArray[i][j].state = 2;
        }
      }
    }
    drawBoard();
    hidePopup();
    // yourPlantArray = []; 
  }
});

function hidePopup() {
  const popup = document.getElementById("plantIdPopup");
  // yourPlantArray = [];
  popup.style.display = "none";
  popupVisible = false;
  printArray(plantArray);
  const searchBar = document.getElementById("plantSearch");
  searchBar.value = "";
}





function updateLegend() {
  if (yourPlantArray.length === 0) {
    console.log("The yourPlantArray is empty.");
    return;
  }

  const legendContainer = document.getElementById("legend");
  legendContainer.innerHTML = ""; // Clear existing content

  // Create a map to store plant ID occurrences
  const plantCounts = new Map();

  // Iterate through the plantArray to count plant occurrences
  for (let i = 0; i < userwidth; i++) {
    for (let j = 0; j < userlength; j++) {
      const plantID = plantArray[i][j].plantID;
      if (plantID >= 0) {
        if (plantCounts.has(plantID)) {
          plantCounts.set(plantID, plantCounts.get(plantID) + 1);
        } else {
          plantCounts.set(plantID, 1);
        }
      }
    }
  }

  // Create legend entries based on plantCounts
  plantCounts.forEach((count, plantID) => {
    const entry = document.createElement("div");
    entry.classList.add("plant-entry");

    const plantImage = document.createElement("img");
    plantImage.classList.add("plant-image");
    // Set the image source based on plant ID (you might need to adjust this)
    plantImage.src = 'https://storage.googleapis.com/myhomepark-images/' + plantID.toString() + '.png';

    const plantInfo = document.createElement("div");
    plantInfo.classList.add("plant-info");
    // Fetch plant name and other info based on plant ID (you might need to adjust this)
    const plantData = yourPlantArray.find(plant => plant.plantID === plantID);
    if (plantData) {
      plantInfo.textContent = `Name: ${plantData.name}, Quantity: ${count}`;
    }

    entry.appendChild(plantImage);
    entry.appendChild(plantInfo);

    legendContainer.appendChild(entry);
  });
}

function getState(zipString) {

  /* Ensure param is a string to prevent unpredictable parsing results */
  if (typeof zipString !== 'string') {
      console.error('Must pass the zipcode as a string.');
      return;
  }

  /* Ensure we have exactly 5 characters to parse */
  if (zipString.length !== 5) {
      console.error('Must pass a 5-digit zipcode.');
      return;
  }

  /* Ensure we don't parse strings starting with 0 as octal values */
  const zipcode = parseInt(zipString, 10);

  let st;
  let state;

  /* Code cases alphabetized by state */
  if (zipcode >= 35000 && zipcode <= 36999) {
      st = 'AL';
      state = 'alabama';
  } else if (zipcode >= 99500 && zipcode <= 99999) {
      st = 'AK';
      state = 'alaska';
  } else if (zipcode >= 85000 && zipcode <= 86999) {
      st = 'AZ';
      state = 'arizona';
  } else if (zipcode >= 71600 && zipcode <= 72999) {
      st = 'AR';
      state = 'arkansas';
  } else if (zipcode >= 90000 && zipcode <= 96699) {
      st = 'CA';
      state = 'california';
  } else if (zipcode >= 80000 && zipcode <= 81999) {
      st = 'CO';
      state = 'colorado';
  } else if ((zipcode >= 6000 && zipcode <= 6389) || (zipcode >= 6391 && zipcode <= 6999)) {
      st = 'CT';
      state = 'connecticut';
  } else if (zipcode >= 19700 && zipcode <= 19999) {
      st = 'DE';
      state = 'delaware';
  } else if (zipcode >= 32000 && zipcode <= 34999) {
      st = 'FL';
      state = 'florida';
  } else if ( (zipcode >= 30000 && zipcode <= 31999) || (zipcode >= 39800 && zipcode <= 39999) ) {
      st = 'GA';
      state = 'georgia';
  } else if (zipcode >= 96700 && zipcode <= 96999) {
      st = 'HI';
      state = 'hawaii';
  } else if (zipcode >= 83200 && zipcode <= 83999 && zipcode != 83414) {
      st = 'ID';
      state = 'idaho';
  } else if (zipcode >= 60000 && zipcode <= 62999) {
      st = 'IL';
      state = 'illinois';
  } else if (zipcode >= 46000 && zipcode <= 47999) {
      st = 'IN';
      state = 'indiana';
  } else if (zipcode >= 50000 && zipcode <= 52999) {
      st = 'IA';
      state = 'iowa';
  } else if (zipcode >= 66000 && zipcode <= 67999) {
      st = 'KS';
      state = 'kansas';
  } else if (zipcode >= 40000 && zipcode <= 42999) {
      st = 'KY';
      state = 'kentucky';
  } else if (zipcode >= 70000 && zipcode <= 71599) {
      st = 'LA';
      state = 'louisiana';
  } else if (zipcode >= 3900 && zipcode <= 4999) {
      st = 'ME';
      state = 'maine';
  } else if ((zipcode >= 20600 && zipcode <= 21999) || (zipcode >= 56900 && zipcode <= 56999)) {
      st = 'MD';
      state = 'marylanddc';
  } else if ( (zipcode >= 1000 && zipcode <= 2799) || (zipcode == 5501) || (zipcode == 5544 ) ) {
      st = 'MA';
      state = 'massachusetts';
  } else if (zipcode >= 48000 && zipcode <= 49999) {
      st = 'MI';
      state = 'michigan';
  } else if (zipcode >= 55000 && zipcode <= 56899) {
      st = 'MN';
      state = 'minnesota';
  } else if (zipcode >= 38600 && zipcode <= 39999) {
      st = 'MS';
      state = 'mississippi';
  } else if (zipcode >= 63000 && zipcode <= 65999) {
      st = 'MO';
      state = 'missouri';
  } else if (zipcode >= 59000 && zipcode <= 59999) {
      st = 'MT';
      state = 'montana';
  } else if (zipcode >= 27000 && zipcode <= 28999) {
      st = 'NC';
      state = 'northCarolina';
  } else if (zipcode >= 58000 && zipcode <= 58999) {
      st = 'ND';
      state = 'northDakota';
  } else if (zipcode >= 68000 && zipcode <= 69999) {
      st = 'NE';
      state = 'nebraska';
  } else if (zipcode >= 88900 && zipcode <= 89999) {
      st = 'NV';
      state = 'nevada';
  } else if (zipcode >= 3000 && zipcode <= 3899) {
      st = 'NH';
      state = 'newHampshire';
  } else if (zipcode >= 7000 && zipcode <= 8999) {
      st = 'NJ';
      state = 'newJersey';
  } else if (zipcode >= 87000 && zipcode <= 88499) {
      st = 'NM';
      state = 'newMexico';
  } else if ( (zipcode >= 10000 && zipcode <= 14999) || (zipcode == 6390) || (zipcode == 501) || (zipcode == 544) ) {
      st = 'NY';
      state = 'newYork';
  } else if (zipcode >= 43000 && zipcode <= 45999) {
      st = 'OH';
      state = 'ohio';
  } else if ((zipcode >= 73000 && zipcode <= 73199) || (zipcode >= 73400 && zipcode <= 74999) ) {
      st = 'OK';
      state = 'oklahoma';
  } else if (zipcode >= 97000 && zipcode <= 97999) {
      st = 'OR';
      state = 'oregon';
  } else if (zipcode >= 15000 && zipcode <= 19699) {
      st = 'PA';
      state = 'pennsylvania';
  } else if (zipcode >= 300 && zipcode <= 999) {
      st = 'PR';
      state = 'puertoRico';
  } else if (zipcode >= 2800 && zipcode <= 2999) {
      st = 'RI';
      state = 'rhodeIsland';
  } else if (zipcode >= 29000 && zipcode <= 29999) {
      st = 'SC';
      state = 'southCarolina';
  } else if (zipcode >= 57000 && zipcode <= 57999) {
      st = 'SD';
      state = 'southDakota';
  } else if (zipcode >= 37000 && zipcode <= 38599) {
      st = 'TN';
      state = 'tennessee';
  } else if ( (zipcode >= 75000 && zipcode <= 79999) || (zipcode >= 73301 && zipcode <= 73399) ||  (zipcode >= 88500 && zipcode <= 88599) ) {
      st = 'TX';
      state = 'texas';
  } else if (zipcode >= 84000 && zipcode <= 84999) {
      st = 'UT';
      state = 'utah';
  } else if (zipcode >= 5000 && zipcode <= 5999) {
      st = 'VT';
      state = 'vermont';
  } else if ( (zipcode >= 20100 && zipcode <= 20199) || (zipcode >= 22000 && zipcode <= 24699) || (zipcode == 20598) ) {
      st = 'VA';
      state = 'virginia';
  } else if (zipcode >= 98000 && zipcode <= 99499) {
      st = 'WA';
      state = 'washington';
  } else if (zipcode >= 24700 && zipcode <= 26999) {
      st = 'WV';
      state = 'wVirginia';
  } else if (zipcode >= 53000 && zipcode <= 54999) {
      st = 'WI';
      state = 'wisconsin';
  } else if ( (zipcode >= 82000 && zipcode <= 83199) || zipcode == 83414 ) {
      st = 'WY';
      state = 'wyoming';
  } else {
      st = 'none';
      state = 'none';
      console.log('No state found matching', zipcode);
  }

  return state;
}

function createStreetView() {
  var idArray = [];
  for (let i = 0; i < userwidth; i++) {
    var row = [];
    for (let j = 0; j < userlength; j++) {
      row.push(plantArray[i][j].plantID);
    }
    idArray.push(row);
  }

  fetch('/insert_image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plant_array: idArray
    })
  })
  .then(response => response.json()) 
  .then(data => {  
    // Do something with the data returned from the server, e.g., update the UI
    console.log("Here is the data")
  })
  .catch(error => console.error('Error:', error));
}



function performPlantSearch(searchText) {
  // Reset search error message
  const searchError = document.getElementById("searchError");
  searchError.textContent = "";

  console.log(searchText);

  // Call Python function to search the database
  fetch('/search_plant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      search: searchText
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update the ID of the plants in the current drift with the returned plant ID
      /*
      const matchingPlantID = data.plantID;
      for (let i = 0; i < userwidth; i++) {
        for (let j = 0; j < userlength; j++) {
          if (plantArray[i][j].driftID === plantArray[clickedPlantRow][clickedPlantCol].driftID) {
            plantArray[i][j].plantID = matchingPlantID;
          }
        }
      }
      drawBoard();
      hidePopup();
      yourPlantArray = [];
      */
      formattedData = [];

      for (let i = 0; i < data.results.length; i++) {
        let plant = {
           "plantID": data.results[i].id,
           "name": data.results[i].data.commonnamex,
           "color": data.results[i].data.color,
           "height": data.results[i].data.hmax,
        }
        formattedData.push(plant);
      }

      yourPlantArray = formattedData;

      showPopup(RowForSearch, ColForSearch, null);
      console.log("changes");
    } else {
      searchError.textContent = "No matching plant found.";
    }
  })
  .catch(error => console.error('Error:', error));
}





drawBoard();

canvas.addEventListener("click", drawRectangle);

document.getElementById("closePopupButton").addEventListener("click", function () {
  hidePopup();
});

document.getElementById("searchButton").addEventListener("click", function () {
    const searchInput = document.getElementById("plantSearch");
    const searchError = document.getElementById("searchError");
    performPlantSearch(searchInput.value);
});


//#####ADD IN EXTRA PLANTS
//#####CONSIDER ADDING A SEARCH IN CASE THEY ARE NOT 
//#####Look into the algorithm because the same plants appear to be coming up
//#####SUN shouldn't be able to be in the wrong one
//#####Add a close button
//#####add some randomness 
//#####always on the screen for the popup
//#####add in functionality for switching between plants and ground cover and xed out squares
//#####add in functionality for the reset button
//#####figure out why it is changing both (need to add to drift id everytime it switches
//#####ground cover make the squares behind it light green (mint)
//prioritize not snapping to the plot but adding the pictures
//troubleshooting to make sure the form doesn't break
//make videos showing how to change stuff
//Add CSS

//Nice to Have:
//search for a plant automatically








