from flask import Flask, render_template, request, jsonify
import logging
import os
import flask_cors
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import json
import google.auth
import random
random.seed(5)
app = Flask(__name__)
flask_cors.CORS(app)
cred = credentials.Certificate('config/serviceAccountKey.json')
try:
    firebase_admin.initialize_app(cred, {'databaseURL':'https://myhomepark-63b0b-default-rtdb.firebaseio.com'})
except ValueError as e:
    print("Error initializing Firebase:", e)
@app.route('/')
def form():
    return render_template('form.html')
@app.route('/submit', methods=['POST']) 
def submit():
    purple = (request.form.get('purple') == 'purple' and 1) or 0
    red = (request.form.get('red') == 'red' and 1) or 0
    blue = (request.form.get('blue') == 'blue' and 1) or 0
    green = (request.form.get('green') == 'green' and 1) or 0
    white = (request.form.get('white') == 'white' and 1) or 0
    lavender = (request.form.get('lavender') == 'lavender' and 1) or 0
    yellow = (request.form.get('yellow') == 'yellow' and 1) or 0
    pink = (request.form.get('pink') == 'pink' and 1) or 0
    violet = (request.form.get('violet') == 'violet' and 1) or 0
    orange = (request.form.get('orange') == 'orange' and 1) or 0
    cream = (request.form.get('cream') == 'cream' and 1) or 0
    fusia = (request.form.get('fusia') == 'fusia' and 1) or 0
    gravel = (request.form.get('gravel') == 'gravel' and 1) or 0
    sand = (request.form.get('sand') == 'sand' and 1) or 0
    loam = (request.form.get('loam') == 'loam' and 1) or 0
    clay = (request.form.get('clay') == 'clay' and 1) or 0
    
    input_colors = [purple, red, blue, green, white, lavender, yellow, pink, violet, orange, cream, fusia]
    soilTypes = [gravel, sand, loam, clay]
    color_names = ["purple", "red", "blue", "green", "white", "lavender", "yellow", "pink", "violet", "orange", "cream", "fusia"]
    #MADE IT 10x
    width = request.form.get('width')
    length = request.form.get('length') 
    sunlevel = request.form['sunlight']
    zipCode = request.form.get('zipcode')
    maxHeight = request.form.get('height')
    #plants = queryDatabase(colors, color_names)
    return render_template('grid.html', input_colors=input_colors, soilTypes=soilTypes, width=width, length=length, sunlevel=sunlevel, zipCode=zipCode, maxHeight=maxHeight)


@app.route('/search_plant', methods=['POST'])
def search_plant():
    print("added red")
    ref = db.reference("/") 
    data = request.get_json()
    search_text = data.get('search', '')
    found = False
    plant_id = -1
    results =[]

    query = ref.order_by_child('purple').start_at(0).end_at(1)
    snapshot = query.get()
    for key, value in snapshot.items():
      if (search_text.lower() in value['commonnamex'].lower()):
        found = True
        results.append({'id': value['id'], 'data': value})

    response_data = {
        'success': found,
        'results': results
    }
    return jsonify(response_data)

@app.route('/query_database', methods=['POST'])
def query_database():
  try:
    data = request.get_json()
    colors = data['colors']
    color_names = data['color_names']
    sunlevel = data['sunlevel']
    maxHeight = data['maxHeight']
    soilTypes = data['soilTypes']
    state = data['state']
    plants = queryDatabase(colors, color_names, sunlevel, maxHeight, soilTypes, state)
    return jsonify(plants=plants)
  except Exception as e:
    print("Error in query_database:", e)
    return jsonify(error="error occurred"), 500


@app.route('/insert_image', methods=['GET', 'POST'])
def insert_image():
  # The ID of the presentation to insert the image into.
  presentation_id = '1TSO6OZD_yYH5OEM3ES_0KB9p-ZH0s66fouAmomYIXAk'
  # The URL of the image to insert.
  image_url = ''
  # The name of the slide to insert the image into.
  slide_name = 'p'
  credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/presentations'])
  service = build('slides', 'v1', credentials=credentials)
  try:
    data = request.get_json()
    plant_array = data['plant_array']
  except Exception as e:
    print("Error in passing plant array:", e)
    return jsonify(error="error occurred"), 500
  print("plant array:", plant_array)
  num_rows = len(plant_array)    
  num_cols = len(plant_array[0])
  image_width_in_pixels = 30
  image_height_in_pixels = 30
  image_x_position_in_points = 100
  image_y_position_in_points = 100
  slide_width_pt = 720 # points
  slide_height_pt = 405 
  cell_width = slide_width_pt / num_cols
  cell_height = slide_height_pt / num_rows
  slide_width_px = 1280 # pixels
  slide_height_px = 720
  image_width_pt = slide_width_pt / min(num_cols, num_rows)
  image_height_pt = image_width_pt
  # start loop
  for row in range(num_rows):
    for col in range(num_cols):
      plant_id = plant_array[row][col]
      if plant_id <= 0: # no plant
        continue
      # create plant url from plant id
      image_url = 'https://storage.googleapis.com/myhomepark-images/' + str(plant_id) + '.png'
      image_id = str(plant_id) + '_image_' + str(random.randint(0, 1000000))
      image_x_position_pt = (col * cell_width) + (cell_width / 2) - (image_width_pt / 2)
      image_y_position_pt = (row * cell_height) + (cell_height / 2) - (image_height_pt / 2)
      requests = [
        {
            'createImage': {
                'objectId': image_id,  
                'elementProperties': {
                    'pageObjectId': slide_name,
                    'size': {
                        'height': {
                            'magnitude': image_height_pt,
                            'unit': 'PT'  # Points
                        },
                        'width': {
                            'magnitude': image_width_pt,
                            'unit': 'PT'  # Points
                        }
                    },
                    'transform': {
                        'scaleX': 1.5,
                        'scaleY': 1.5,
                        'translateX': image_x_position_pt,
                        'translateY': image_y_position_pt,
                        'unit': 'PT'
                    }
                },
                'url': image_url,
            },
        },
      ]
      response = service.presentations().batchUpdate(
        presentationId=presentation_id, body={'requests': requests}).execute()
  return json.dumps({'image_id': response['replies'][0]['createImage']['objectId']})


def queryDatabase(colors, color_names, sunlevel, maxHeight, soilTypes, state):
    print("Started Function")
    print("Colors:", colors)
    print("Color Names:", color_names)
    ref = db.reference("/") 
    highScorePlants = []
    colorWeight = 2   
    sunWeight = 3
    heightWeight = 2
    soilWeight = 2
    nativeWeight = 4
    plants = []
    highPlantID = 0
    highScore = 0
    """
    snapshot = ref.order_by_child('commonnamex').get()
    print("Type of snapshot:", type(snapshot))
    print("Contents of list:", snapshot)
    print(snapshot[0])
    """
    query = ref.order_by_child('purple').start_at(0).end_at(1)
    snapshot = query.get()
    for key, value in snapshot.items():
      currentScore = 0
      colorScore = 0
      sunScore = 0
      heightScore = 0
      soilScore = 0
      nativeScore = 0
      for x in range(len(colors)):
        if (value[color_names[x]] == 1 and colors[x] == True):
          colorScore = 1
          break
      if (sunlevel == "fullShade" and value['smin'] == 1):
        sunScore = 1
      elif (sunlevel == "partSun" and value['smin'] <= 2 and value['smax'] >= 2):
        sunScore = 1
      elif (sunlevel == "fullSun" and value['smax'] == 3):
        sunScore = 1
      
      if (maxHeight == 24):
        if (int(value['hmax']) <= 24):
          heightScore = 1
        else: 
          heightScore = 0
          # print("Set to Zero")
        # print("MAXHEIGHT24   plant ", value['id'], "   hmax=", value['hmax'], "   heightScore=", heightScore)
      else:
        heightScore = 1 - abs(maxHeight-int(value['hmax']))/100
        # print("MAXHEIGHT NOT24   plant ", value['id'], "   hmax=", value['hmax'], "   heightScore=", heightScore)
      
      #soilTypes == gravel, sand, loam, clay
      if ((soilTypes[0] and value['gravel'] == 'Yes') or (soilTypes[1] and value['sand'] == 'Yes') or (soilTypes[2] and value['loam'] == 'Yes') or (soilTypes[3] and value['clay'] == 'Yes')):
        soilScore = 1
      else:
        soilScore = 0
      
      
      try:
          if (value[state] == "Native"):
            # print(value['id'], "set to 1 for", state)
            nativeScore = 1
      except Exception as e:
          nativeScore = 0
          # print(value['id'], "set to 0 for", state)

      currentScore = colorScore*colorWeight + sunScore*sunWeight + heightScore*heightWeight + soilScore*soilWeight + nativeScore*nativeWeight

      print("plantID=", value['id'], "currentScore=", round(currentScore,2), " color=", colorScore*colorWeight, " sun=", sunScore*sunWeight, " height=", round(heightScore*heightWeight,2), " native=", nativeScore*nativeWeight)

      if (currentScore > highScore):
        highScore = currentScore
        print("highPlantID=",highPlantID, " new highPlantID=", value['id'])
        highPlantID = value['id']
        plants.append(value['id'])
      
      if len(highScorePlants) < 15 or currentScore > highScorePlants[-1]['score']:
        highScorePlants.append({'id': value['id'], 'score': currentScore, 'data': value})
        highScorePlants.sort(key=lambda x: x['score'], reverse=True)
        if len(highScorePlants) > 15:
          highScorePlants.pop()
    for x in range(len(highScorePlants)):
      print("plantID=", highScorePlants[x]['id'], "    score=", highScorePlants[x]['score'])
    return highScorePlants

@app.errorhandler(500)
def server_error(e):
    logging.exception("An error occurred during a request.")
    return "An internal error occurred.", 500
