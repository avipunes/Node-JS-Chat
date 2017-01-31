var $nickBox;
var socket;
var $nickForm;
var $nickError;
var $nickBox;
var $users;
var $messageFrom;
var $messageBox;
var $chat;
var $myNick;
var $submitButton;
var $userImg;


jQuery(function($){
	$('#nickWarp').addClass('openWin');

	socket = io.connect();
	$nickForm = $('#setNick');
	$nickError = $('#nickError');
	$nickBox = $('#nickname');
	$users = $('#users');
	$messageFrom =  $('#send-message');
	$messageBox =  $('#message');
	$chat =  $('#chat');
	$myNick;
	$submitButton = $('#submit');
	$nickBox.focus();

	$nickForm.submit(function(e) {
		e.preventDefault();
		$myNick =$nickBox.val();
		socket.emit('new user', $myNick, function(data){
			if (data) {
				$('#nickWarp').removeClass('openWin');
				setTimeout(function() {
					$('#nickWarp').hide();
				},1000);
				$('#contentWarp').show();
				 if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
				 // some code..
				}else{
				 	$messageBox.focus(); 
				}
			}else{
				if ($nickError.hasClass('on')) {
					$nickError.toggleClass('on');
					setTimeout(function(){
						$nickError.toggleClass('on');
					},500);
				}else{
					$nickError.addClass('on');
				}
			}
		});
		$nickBox.val('');
	});


	socket.on('usernames', function(data){
		var html = '';
		html += '<span class="userTitle">Users:</span>'
		for (var i = 0 ; i < data.length ; i++) {
			if (data[i].indexOf("https://fb")>= 0) {
    			html +='<img src="' + data[i] + '" class="profileImg"/>';
			}else if (data[i] === $myNick) {
				html += '<li id="myUserId" class="user myUser">' + data[i] + '</li>';
			}else{
				html += '<li class="user">' + data[i] + '</li>';
			}
		}
		$users.html(html);

        $('.user').on('click <taphold></taphold>', function(event) {
        	event.preventDefault();
        	var user = $(this)[0].innerHTML;
            $messageBox.val('/w '+user +', ');
			 if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			 // some code..
			}else{
			 	$messageBox.focus(); 
			}

        });
	});

	$messageFrom.submit(function(e) {
		e.preventDefault();
		socket.emit('send message', $messageBox.val().trim(), function(data){
			$chat.append('<span class="error">' + '<pre>' + data + '</pre>' + '</span><div class="divider"></div>');
		});
		$messageBox.val('');
	});

	socket.on('new user', function(data , nName){
		$chat.append('<span class="newUser"><b>' +nName + ': </b>' + data + '</span><div class="divider"></div>');
	});

	socket.on('new message', function(data , nName){
		if (nName!= $myNick) {
				$('#newMsg')[0].play();
			Push.create('New Message From '+nName, {
			    body: data,
			    icon: 'js/push.js-master/logo.png',
			    timeout: 4000,
			    onClick: function () {
			        window.focus();
			        this.close();
			    }
			});
		}
		if($userImg){
			$chat.append('<span class="msg"><img src="' + $userImg + '" class="profileImgChat"/><b>' +nName + ': </b>' + '<pre>' + data + '</pre>' + '</span><div class="divider"></div>');
		}else{
			$chat.append('<span class="msg"><b>' +nName + ': </b>' + '<pre>' + data + '</pre>' + '</span><div class="divider"></div>');
		}
	});

	socket.on('whisper', function(data, nName){
		if (nName!= $myNick) {
				$('#newMsg')[0].play();
			Push.create('New Whisper Message From '+nName, {
			    body: data,
			    icon: 'js/push.js-master/logo.png',
			    timeout: 4000,
			    onClick: function () {
			        window.focus();
			        this.close();
			    }
			});
		}
		if($userImg){
			$chat.append('<span class="msg"><img src="' + $userImg + '" class="profileImgChat"/><b>' +nName + ': </b>' + '<pre>' + data + '</pre>' + '</span><div class="divider"></div>');
		}else{
			$chat.append('<span class="msg"><b>' +nName + ': </b>' + '<pre>' + data + '</pre>' + '</span><div class="divider"></div>');
		}
	});

	socket.on('user disconnect', function(data , nName){
		$chat.append('<span class="disconnect"><b>' +nName + ': </b>' + data + '</span><div class="divider"></div>');
	});


	$messageBox.keydown(function (e) {
		//when ctrl+enter press when foucs on message box, send the message.
	  if (e.ctrlKey && e.keyCode == 13) {
	    $submitButton.trigger("click");
	  }
	});



	$("#usersWarp").draggable();

	$("#users").on('click', function(){
		$("#usersWarp").toggleClass('clicked');
		$users.toggleClass('clicked');
	});

	window.fbAsyncInit = function() {
	    // FB JavaScript SDK configuration and setup
	    FB.init({
	      appId      : '1924474697783747', // FB App ID
	      cookie     : true,  // enable cookies to allow the server to access the session
	      xfbml      : true,  // parse social plugins on this page
	      version    : 'v2.8' // use graph api version 2.8
	    });
	    
	    // Check whether the user already logged in
	    FB.getLoginStatus(function(response) {
	        if (response.status === 'connected') {
	            //display user data
	            getFbUserData();
	        }
	    });
	};

	// Load the JavaScript SDK asynchronously
	(function(d, s, id) {
	    var js, fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) return;
	    js = d.createElement(s); js.id = id;
	    js.src = "//connect.facebook.net/en_US/sdk.js";
	    fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));


});

// Facebook login with JavaScript SDK
function fbLogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            // Get and display the user profile data
            getFbUserData();
        } else {
            document.getElementById('status').innerHTML = 'User cancelled login or did not fully authorize.';
        }
    }, {scope: 'email'});
}

// Fetch the user profile data from facebook
function getFbUserData(){
    FB.api('/me', {locale: 'en_US', fields: 'id,first_name,last_name,email,link,gender,locale,picture'},
    function (response) {
		if (response) {
			socket.emit('facebook data', response, function(data){
				setTimeout(function() {
	    			// $('<img src="' + data + '" class="profileImg"/>').insertAfter( "#myUserId" );/
					$userImg = data;
				},1000);
			});
		}    	
		var $firsrSubmitButton = $('.submitFirst');
    	$nickBox.val(response.first_name +' '+ response.last_name);
    	$firsrSubmitButton.trigger("click");
    });
}

// Logout from facebook
function fbLogout() {
    FB.logout(function() {
        document.getElementById('fbLink').setAttribute("onclick","fbLogin()");
        document.getElementById('fbLink').innerHTML = '<img src="fblogin.png"/>';
        document.getElementById('userData').innerHTML = '';
        document.getElementById('status').innerHTML = 'You have successfully logout from Facebook.';
    });
}
