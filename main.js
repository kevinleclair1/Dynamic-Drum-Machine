var app = {};

app.url = "http://www.freesound.org/apiv2/search/text/";
// http:www.freesound.org/apiv2/search/text/?query=cars
// http:www.freesound.org/apiv2/search/text/?page_size=150&query=dog&token=6ce06a6265fd48dfb14995caba45fa746e6c3288&filter=duration%3A%5B0+TO+2%5D
app.key = function(){
	var keyArray = ['a94e300dd630214779394cd94467955649cc5b2d','6456665a0533915b9d76966a56945892a0a723b6', '718559268c3e6ab18aae2bde65af810177e7adf2'];
	var keyNum = Math.floor(Math.random()*keyArray.length);
	return keyArray[keyNum];
}
app.init = function(){
	$('.searchForm').on('submit', function(e){
		e.preventDefault();
		var searchWord = $('.searchWord').val();
		console.log(searchWord);
		app.getResults(searchWord);
	});
	$('.grid').on('click','.pad',function(){
		console.log('clicked');
		var audio = $(this).find('.sample')[0];
		audio.currentTime = 0;
		audio.play();
		console.log('sound played');
		$(this).addClass('animated pulse').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		  //when the animation is finished - do thi
		  $(this).removeClass('animated pulse');
		  console.log('we removed the class');
		  //random comment for git
		});
	});

	$(window).on('keydown',function(e){
		if(!($('.onoffswitch-checkbox').is(':checked'))) {
			console.log("It's not checked, so don't play any sound");
			return; // stops the rest of the function from running
		}
			
		var keys = [81,87,69,82,84,89,65,83,68,70,71,72]; // QWERTY
		// check if the key we pressed in inside our keys
		var keyIndex = keys.indexOf(e.keyCode);

		if(keyIndex != -1)  {
			// its in the array
			var padSelect = $('.pad').eq(keyIndex);
			var audio = $('.pad').eq(keyIndex).find('audio')[0];
			audio.currentTime = 0;
			audio.play();
			console.log('sound played');
			padSelect.addClass('animated pulse').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			  //when the animation is finished - do thi
			  padSelect.removeClass('animated pulse');
			  console.log('we removed the class');
			});
		}
	});
	$('.stop').on('click', function(){
		var $sample = $('.sample');
		$sample.trigger('pause');
	});
};
//.getResults takes input from forms, creates initial ajax call to freesound.org api based
//on those keywords and length
app.getResults = function(i){
	//add spinner class
	$('.overlay').fadeIn(600);
	var minLength = $('.minLength').val();
	var maxLength = $('.maxLength').val();
	var query = {
		query: i,
		page_size: '150',
		token: app.key,
		filter: 'tag:' + i,
	}
	if(minLength && maxLength) {
		query.filter = 'duration:[' + minLength + ' TO ' + maxLength + '] tag:' + i;
	}
	$.ajax({
		url: app.url,
		type : 'GET',
		dataType: 'json',
		data: query,
		success: function(data) { //function is a callback, will work when data is received 
			console.log(data);
			var results = data.results;
			var soundIds = []
			//for loop takes 16 random objects from data.results, takes their id# and pushes
			//those numbers into an array
			for (var i = 0; i < 12; i++) {
				var resultNumber = (app.randomNumber(results));
				var soundId = results[resultNumber].id;
				console.log(soundId);
				soundIds.push(soundId);	
			};
			$('.grid').empty();
			//this loop passes each ID through .getSounds to retrieve their sound data from the API
			for (var i = 0; i < soundIds.length; i++) {
				var soundObject = soundIds[i];
				app.getSounds(soundObject);

				//call function .getSounds, pass argument of ID#
			};
			$('html, body').animate({
			    scrollTop: $(".onoffswitch").offset().top
			}, 1500);
			$('.overlay').fadeOut(1000);
		},
	});
};
//find in .getResults success function, first for loop
//takes length of results array and gets 
app.randomNumber = function(i){
	var num = Math.floor(Math.random()*i.length);
	return num;
}
//find .getSounds in the .getResults success function
//.getSounds will take ID numbers from original ajax call and create multiple ajax calls based on given ID numbers
app.getSounds = function(i){
	var urlSound = "http://www.freesound.org/apiv2/sounds/" + i + "/";
	$.ajax ({
		url: urlSound,
		type : 'GET',
		data: {
			token: app.key,
		},
		dataType: 'json',
		success: function(data) {
			//get previews.preview-hq-mp3, also preview-hq-ogg for cross browser support
			console.log(data);
			var link = data.url;
			var mp3 = data.previews['preview-hq-mp3'];
			var ogg = data.previews['preview-hq-ogg'];
			//create new audio element and put inside each pad
			var linkTag = $('<a>').addClass('sampleUrl').html('<i class="fa fa-link"></i>').attr( { href: link, target: '_blank'} );
			var pad = $('<div>').addClass('pad');
			var audio = $('<audio>').addClass('sample').attr('src',mp3);
			pad.append(audio,linkTag);
			$('.grid').append(pad);
			//remove spinner
			//create array of audio element classes to inject audio element into
		}
	});
};

//get 16 random numbers based on size of results array
//get id number from each result
//ajax call for each id number retreiving preview
$(function() {
	var howTo = $('.howTo');
	$('.howToToggle').on('click', function(){
		howTo.slideToggle();
	});
	$('.fa-times-circle').on('click', function(){
		howTo.slideToggle();
	});
	app.init();
});