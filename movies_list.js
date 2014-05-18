Movies = new Meteor.Collection("movies");

if (Meteor.isClient) {
  Template.movies_list.movies = function (){
  	return Movies.find({}, {sort: {title: 1}})
  };
	Template.movies_list.helpers({
	settings: function () {
		return {
		    rowsPerPage: 5,
		    showFilter: false,
		    fields: [
		    { key: 'title', label: 'Movie Title'}, 
		    { key: 'year', label: 'Release Year'},
		    { key: 'genre', label: 'Genre'},
		    { key: 'edit', label: 'Edit', tmpl: Template.movies_edit},
			{ key: 'delete', label: 'Delete', tmpl: Template.movies_info}
		
		    ]
		};
	}
	});
	Template.fbook.helpers({
		config: function () {
			return {
				href: "http://movies_list.meteor.com"
			}
		}
	});
  Template.movies_list.events = {
	'click .reactive-table input.delete': function(e) {
		e.preventDefault();
		console.log(this);
		if(confirm("Are you sure?")) {
			Movies.remove(this._id);
	 	}
	},
	'click .reactive-table input.edit': function(event) {
		resetSelected();
		event.currentTarget.parentNode.parentNode.className = 'selected';
		$("#title").val(this.title);
		$("#year").val(this.year);
		$("#genre").val(this.genre);
		Session.set('selectedId', this._id);
	}
  };
  Template.movieform.events = {
  	'reset': function(event){
  		Session.set('selectedId', '');//reset selectedId to nothing so that it doesn't update the former field.
  		console.log("reset."+Session.get('selectedId'));
	  	resetSelected();
  	},
	'submit' : function(event) {
		event.preventDefault();
	    var properties = {
	      title:  $('#title').val(),
	      year:   $('#year').val(),
	      genre:  $('#genre').val()
	    };

	    Movies.update(
	    	{_id: Session.get("selectedId")}, 
	    	{$set: properties},
	    	{ upsert: true },
	    	function(err) {
	        if(!err) {
	        	console.log("Submitted."+Session.get('selectedId'));
	        	console.log(properties['title']);
	            Meteor.call("tweets", properties['title']);
	        	resetSelected();
	        	//no need to clear selectedId, because reset function already does this.
	            $('#myform')[0].reset();
	            
	        }
	        else
	        {
	            alert("Whoops! Something went wrong.")
	            console.log(err);
	        }});
  
	}
  };
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '471735972958035' ,
      status     : true,
      xfbml      : true
    });
  };
  
}
function resetSelected(){
	var getSelected = document.getElementsByClassName('selected');
		for (var i=0; i<getSelected.length; i++){
			getSelected[i].className = '';
		}
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		if (Movies.find().count() === 0) {
			var newmovies = [["Amelie", "1995", "Foreign"],
		               ["Batman Begins", "2011", "Action"],
		               ["Dumb and Dumber", "1993", "Comedy"]];
			for (var i = 0; i < newmovies.length; i++)
		    	Movies.insert({title: newmovies[i][0], year: newmovies[i][1], genre: newmovies[i][2]});
			}
	});
  
	Meteor.methods({
		tweets: function(arg1){
		
			T = new TwitMaker({
				consumer_key:         'JeuMy8LqFK4oFF0DBqVPIswew', 
				consumer_secret:      'gBaapKI98AOEsXCgWAtj2hgOvFxm6eLcTPN3h6Q92o2mGVZJbC', 
				access_token:         '48142248-1MqH27NrwxgjBZBm5MtsyGGlhKNYO25LgLHOco9Fd', 
				access_token_secret:  'Oq5xZqjoi9f1OVFIjOvAnbsLOaR7OiSIJpAWJh0Ftsax8'
			});
			
			T.post('statuses/update', { status: arg1+' was just added to my movie collection.' }, function(err, data, response) {
				console.log(data, response);
			}) 
		}    
	}) 
}