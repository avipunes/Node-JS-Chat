jQuery(function($){
	$('#nickWarp').addClass('openWin');

	var socket = io.connect();
	var $nickForm = $('#setNick');
	var $nickError = $('#nickError');
	var $nickBox = $('#nickname');
	var $users = $('#users');
	var $messageFrom =  $('#send-message');
	var $messageBox =  $('#message');
	var $chat =  $('#chat');
	var $myNick;
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
				$messageBox.focus();
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
		for (var i = 0 ; i < data.length ; i++) {
			if (data[i] === $myNick) {
				html += '<li class="user myUser">' + data[i] + '</li>';
			}else{
				html += '<li class="user">' + data[i] + '</li>';
			}
		}
		$users.html(html);

        $('.user').on('click', function(event) {
        	event.preventDefault();
        	var user = $(this)[0].innerHTML;
            $messageBox.val('/w '+user +' ');
        	$messageBox.focus();

        });
	});

	$messageFrom.submit(function(e) {
		e.preventDefault();
		socket.emit('send message', $messageBox.val().trim(), function(data){
			$chat.append('<span class="error">' + data + '</span><br/>');
		});
		$messageBox.val('');
	});

	socket.on('new user', function(data , nName){
		$chat.append('<span class="newUser"><b>' +nName + ': </b>' + data + '</span><br/>');
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
		$chat.append('<span class="msg"><b>' +nName + ': </b>' + data + '</span><br/>');
	});

	socket.on('whisper', function(data, nName){
		$chat.append('<span class="whisper"><b>' +nName + ': </b>' + data + '</span><br/>');
	});

	socket.on('user disconnect', function(data , nName){
		$chat.append('<span class="disconnect"><b>' +nName + ': </b>' + data + '</span><br/>');
	});


});