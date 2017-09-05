//### Instructions

//* Make sure that your app suits this basic spec:
  
//  * When adding trains, administrators should be able to submit the following:
    
//    * Train Name
//    * Destination 
//    * First Train Time -- in military time
//    * Frequency -- in minutes

//  * Code this app to calculate when the next train will arrive; this should be relative to the current time.
  
//  * Users from many different machines must be able to view same train times.
  
//  * Styling and theme are completely up to you. Get Creative!



//$(document).ready(function() {

	/* global firebase */

// Initialize Firebase

	var config = {
		apiKey: "AIzaSyCeAgNHJbtPkMKG6K82kd-azxdMTx_nDpA",
		authDomain: "goodyrail.firebaseapp.com",
		databaseURL: "https://goodyrail.firebaseio.com",
		projectId: "goodyrail",
		storageBucket: "",
		messagingSenderId: "608072725851"
	};
	firebase.initializeApp(config);


// Create a variable to reference the database
	var database = firebase.database();
	var dbkey = database.key;


// --------------------------------------------------------------

	//Variables for the initial case, will hold user data
	var name = "";
	var destination = "";
	var firstTrainTime = "";
	var frequency = 0;

	var trainIDs = [];		//Holds the keys for each train to be used in removal and edits
	var globalIndex = 0;	//Used to keep track of which element for removal and editing

	//Displays the current time
	var currentTime = moment().format('h:mm A');
	$('#currentTime').html("The time is now: " + currentTime);

	//When you add a train to the database
	$('#addTrain').click(function() {
		console.log("Entering my-form block:...")
		name = $('#nameinput').val().trim();
		console.log("This is the value of name:..." + name);
		destination = $('#destinationinput').val().trim(); 
		console.log("This is the value of destination:..." + destination);
		firstTrainTime = $('#firstTraininput').val().trim();
		console.log("This is the value of firstTrainTime:..." + firstTrainTime);
		frequency = $('#frequencyinput').val().trim();
		console.log("This is the value of frequency:..." + frequency);

		// Save new value to Firebase
		
		database.ref().push({
			name: name,
			destination: destination,
			firstTrainTime: firstTrainTime,
			frequency: frequency,
		});

		//Reload needed for the removal to work on last element
		location.reload();
		return false;
	});

	//Will display changes when there are children added to the database
	database.ref().on("child_added", function(snapshot) {

		// Will work on validator later, would alert twice and was annoying
		// if(!moment(snapshot.val().firstTrainTime, "HH:mm").isValid()) {
		// 	alert("The train on line " + (globalIndex + 1) + " is not valid.  Please edit train and enter a military time, for example 04:15 or 18:23.");
		// }

		//Calculating the next train arrival time and the minutes until it arrives
		var firstTrainMoment = moment(snapshot.val().firstTrainTime, "hh:mm").subtract(1, "years");
		var diffTime = moment().diff(moment(firstTrainMoment), "minutes");
		var remainder = diffTime % snapshot.val().frequency;
		var minUntilTrain = snapshot.val().frequency - remainder;
		var nextTrain = moment().add(minUntilTrain, "minutes");
		var deletme = "ridme-" + globalIndex;

//		console.log("Train Name: " + snapshot.val().name);
//		console.log("Destination: " + snapshot.val().destination);
//		console.log("First Train: " + snapshot.val().firstTrainTime);
//		console.log("Frequency: " + snapshot.val().frequency);
//		console.log("Next Train Time: " + moment(nextTrain).format("hh:mm A"));
//		console.log("Minutes Until: " + minUntilTrain);
//		console.log("====================");


		$('#display').append("<tr><td id='nameDisplay'>" + snapshot.val().name +
			"</td><td id='destinationDisplay'>" + snapshot.val().destination +
			"</td><td id='frequencyDisplay'>" + "Every " + snapshot.val().frequency + " mins" +
			"</td><td id='nextArrivalDisplay'>" + moment(nextTrain).format("hh:mm A") +
			"</td><td id='minutesAwayDisplay'>" + minUntilTrain + " minutes until arrival" +
			"</td><td id='editbuttons'><button class='removeme' id=" + deletme + " data-indexNum=" + globalIndex + " title='Remove Train?'><div class='glyphicon glyphicon-trash'></div></button> " +
			"<button class='editme' data-indexNum=" + globalIndex + " title='Edit Train?'><div class='glyphicon glyphicon-pencil'></div></button></td>");

		globalIndex++;

	}, function (errorObject) {

	  	console.log("The read failed: " + errorObject.code);

	});

	//Gets the train IDs in an Array
	database.ref().once('value', function(dataSnapshot){ 
    	var indexofTrains = 0;

        dataSnapshot.forEach(
            function(childSnapshot) {
                trainIDs[indexofTrains++] = childSnapshot.key;
            }
        );
    });

	
	//When you click on the edit button, it asks you for each item again and sets it to the database
	$(document.body).on('click', '.editme', function(){
		
		var x = $(this).attr("data-indexNum");
		var num = x;
		
		console.log("This is the value of num in .editme:..." + num);

		name = prompt("What do you want the name to be?");
		destination = prompt("What do you want the destination to be?");
		firstTrainTime = prompt("What time did the first train arrive? (HH:mm - military time)");
		frequency = prompt("How often does it arrive? (in minutes)");


		database.ref().child(trainIDs[num]).set({
			name: name,
			destination: destination,
			firstTrainTime: firstTrainTime,
			frequency: frequency
		});

		//Must reload to show the database changes on the page
		location.reload();

});
	
	//When you click on the remove buttons, it gets the row it's on and deletes it from the database
	$(document.body).on('click', '.removeme', function(){

		var y = $(this).attr("data-indexNum");
		var num = y;
				
		console.log("This is the value of num in .removeme:..." + num);		
		database.ref().child(trainIDs[num]).remove();

		//Must reload to show the database changes on the page
		location.reload();
//	}
});
	
//});	
