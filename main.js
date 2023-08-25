// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

$(function(){
  // This is the host for the backend.
  // TODO: When running Firenotes locally, set to http://localhost:8081. Before
  // deploying the application to a live production environment, change to
  // https://backend-dot-<PROJECT_ID>.appspot.com as specified in the
  // backend's app.yaml file.
  var backendHostUrl = 'https://backend-dot-my-home-park-392812.appspot.com';

  // [START gae_python_firenotes_config]
  // Obtain the following from the "Add Firebase to your web app" dialogue
  // Initialize Firebase

  const yamlConfig = yaml.safeLoad(fs.readFileSync('app.yaml', 'utf8'));
  const apiKey = yamlCOnfig.API_KEY

  var config = {
    apiKey: apiKey,
    authDomain: "myhomepark-63b0b.firebaseapp.com",
    databaseURL: ""https://myhomepark-63b0b-default-rtdb.firebaseio.com"",
    projectId: "myhomepark-63b0b",
    storageBucket: "myhomepark-63b0b.appspot.com",
    messagingSenderId: "668417262072"
  };
  // [END gae_python_firenotes_config]

  // This is passed into the backend to authenticate the user.
  var userIdToken = null;

  // [START gae_python_fetch_notes]
  // Fetch notes from the backend.
  function fetchNotes() {
    $.ajax(backendHostUrl + '/notes', {
      /* Set header for the XMLHttpRequest to get data from the web server
      associated with userIdToken */
      headers: {
        'Authorization': 'Bearer ' + userIdToken
      }
    }).then(function(data){
      $('#notes-container').empty();
      // Iterate over user data to display user's notes from database.
      data.forEach(function(note){
        $('#notes-container').append($('<p>').text(note.message));
      });
    });
  }
  // [END gae_python_fetch_notes]

  // Save a note to the backend
  var saveNoteBtn = $('#add-note');
  saveNoteBtn.click(function(event) {
    event.preventDefault();

    var noteField = $('#note-content');
    var note = noteField.val();
    noteField.val("");

    /* Send note data to backend, storing in database with existing data
    associated with userIdToken */
    $.ajax(backendHostUrl + '/notes', {
      headers: {
        'Authorization': 'Bearer ' + userIdToken
      },
      method: 'POST',
      data: JSON.stringify({'message': note}),
      contentType : 'application/json'
    }).then(function(){
      // Refresh notebook display.
      fetchNotes();
    });

  });

  configureFirebaseLogin();
  configureFirebaseLoginWidget();

});
