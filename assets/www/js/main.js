$(document).on('pageinit', '#countdown_page', function() {
	$('#stop_b').parent().hide();
	$('#resume_b').parent().hide();
	$('#restart_b').parent().hide();

	/*jQuery.extend(jQuery.mobile.datebox.prototype.options, {
	    'dateFormat': 'mm/dd/YYYY',
	    'headerFormat': 'mm/dd/YYYY',
	});*/

	$('#min').change(function() {
		console.log("change");

		if($('#cdown').countdown('getTimes') !== null ) {
			navigator.notification.confirm("Would you like to interrupt current countdown and start a new one?", 
					function(buttonIndex) {
						switch(buttonIndex)
						{
							case 1:
								var time_val = $('#min').val();
								startCountdown(time_val);
								break;
							default:
								break;
						}
			});
		}
	});

	$(this).on('tap', '#savedtimes li', function() {
		console.log("list tap");
		var patt = new RegExp("[0-9][0-9]:[0-9][0-9]");
		var result = patt.exec($(this).text());
		var time = result[0].split(":");
		var mins = parseInt(time[0]);
		var secs = parseInt(time[1]);
		startCountdown(mins,secs);
	});

	$('#start_b').on('tap', function() {
		console.log("tap start");
		var time_val = $('#min').val();
		destroyCountdown();
		startCountdown(time_val);
		//$('#start_b').parent().hide();
		//$('#stop_b').parent().show();
	});

	$('#stop_b').on('tap', function() {
		console.log("tap stop");
		pauseCountdown();
		$(this).parent().hide();
		$('#resume_b').parent().show();
		$('#resume_b').parent().css("background", "#5DC86B");
		$('#resume_b').parent().trigger("refresh");
	});

	$('#resume_b').on('tap', function() {
		console.log("tap resume");
		resumeCountdown();
		$(this).parent().hide();
		$('#stop_b').parent().show();
	});

	$('#restart_b').on('tap', function() {
		console.log("tap restart");
		var patt = /[0-9]{1,2}/g;
		var result = $('#cdown').countdown('option', 'until').match(patt);
		startCountdown(result[0], result[1]);
	});

	$(this).on('pagebeforeshow', function() {
		console.log("countdown_page pagebeforeshow");
		updateLast5();
	});
});

$(document).on('pageinit', '#addcd_page', function() {

	console.log("addcd_page pageinit");
	clearFields();

	$('#savetime_b').tap(function() {
			console.log("tap save");
			var time_val = $('#time2save').val();
			var name_val = $('#timename').val();
			saveTime(time_val, name_val);
			showAlert();
	});

	$('#addcd_page').on('pagebeforeshow', function() {
		console.log("addcd_page pagebeforeshow");
		$('#time2save').val("");
		$('#timename').val("");
	});
});

$(document).on('pageinit', '#list_page', function() {
	console.log("list_page pageinit");
	
	$('#list_page').on('pagebeforeshow', function() {
		console.log("list_page pagebeforeshow");
		showList();
	});

	$(this).on('tap', '#time_list li', function() {
		console.log("time_list tap");

		var patt = new RegExp("[0-9][0-9]:[0-9][0-9]");
		var result = patt.exec($(this).text());
		var time = result[0].split(":");
		var mins = parseInt(time[0]);
		var secs = parseInt(time[1]);
		showConfirm(mins, secs);
	});
});

function startCountdown(mins, secs) {;
	console.log("start");

	if(typeof(secs) == 'undefined') secs = 0;
	destroyCountdown();

	$('#cdown').countdown(
		{until: '+' + mins + 'm' + secs + 's', 
		format: 'HMS', 
		layout: '<div class="countdown_section">' +
				'<span class="digits">{mnn}</span><span class="separator">:</span>' + 
				'<span class="digits">{snn}</span></div>',
		expiryText: '<span id="timeup">Time\'s up!</span>',
		onExpiry: notifyUser

	});

	$('#start_b').parent().hide();
	$('#resume_b').parent().hide();
	$('#restart_b').parent().show();
	$('#stop_b').parent().show();
	$('#stop_b').parent().css("background", "#E47373");
	$('#stop_b').parent().trigger("refresh");
};

function pauseCountdown() {
	console.log("pause");
	$('#cdown').countdown('pause');
};

function resumeCountdown() {
	console.log("resume");
	$('#cdown').countdown('resume');
};

function destroyCountdown() {
	console.log("destroy");
	$('#cdown').countdown('destroy');
};

function saveTime(time, name) {
	if (!window.localStorage.getItem(name)) {
		var values = new Array();
		values.push(name);
		values.push(time);
		timestampId = new Date().getTime();

		window.localStorage.setItem(timestampId, values.join(";"));
		console.log("SAVED: key: " + timestampId + " values: " + window.localStorage.getItem(timestampId));
	};
};

function getTimes() {
	var localStorageKeys = Object.keys(localStorage);

	for (var i = 0; i < localStorageKeys.length; i++) {
		if(!localStorageKeys[i].match(/[0-9]{1,}/)) {
			localStorageKeys = jQuery.grep(localStorageKeys, function(value) {
				return value != localStorageKeys[i];
			});
		}
	};

	localStorageKeys.sort(compareNumbers);
	localStorageKeys.reverse();
	console.log(localStorageKeys);
	var times = new Array();

	for (var i = 0; i < localStorageKeys.length; i++) {
		times.push(window.localStorage.getItem(localStorageKeys[i]));
	};
	
	return times;
};

function compareNumbers(a, b) {
  return a - b;
};

function updateLast5() {
	if (window.localStorage.length == 0 || (window.localStorage.length == 1 && localStorage.getItem("ripple-last-load") !== null)) {
		$('#last5').html("<p>No saved times. Try to add one.</p>");
		return;
	};

	// Some user times are saved
	var times = new Array();
	times = getTimes();
	var values;
	var rawHTML = "<ul id=\"savedtimes\" data-role=\"listview\" data-inset=true>";
	var timeSize = 0;

	if(times.length <= 5) timeSize = times.length;
	else timeSize = 5;

	for (var i = 0; i < timeSize; i++) {
		values = times[i].split(";");
		rawHTML += ("<li><a>" + values[0] + " <span class='ui-li-count'>" + values[1] + "</span></a></li>");
	};

	//rawHTML += "</ul>";
	$('#last5').html(rawHTML);
	$('#savedtimes').listview();
};

function showList() {
	if (window.localStorage.length == 0 || (window.localStorage.length == 1 && localStorage.getItem("ripple-last-load") !== null)) {
		$('#time_list').html("<p>No saved times. Try to add one.</p>");
		return;
	};

	// Some user times are saved
	var times = new Array();
	times = getTimes();
	var values;
	var rawHTML = "<ul id=\"alltimes\" data-role=\"listview\" data-filter=\"true\" data-inset=true>";

	for (var i = 0; i < times.length; i++) {
		values = times[i].split(";");
		rawHTML += ("<li><a>" + values[0] + " <span class='ui-li-count'>" + values[1] + "</span></a></li>");
	};

	rawHTML += "</ul>";
	$('#time_list').html(rawHTML);
	$('#alltimes').listview();
};

function showAlert() {
	navigator.notification.alert("Your time has been saved.", clearFields, "Success");
};

function clearFields() {
	$('#time2save').textinput();
	$('#time2save').val("");
	$('#timename').textinput();
	$('#timename').val("");
};

function showConfirm(mins, secs) {
	navigator.notification.confirm("Would you like to start timer for this time?", 
		function(buttonIndex) {
			switch(buttonIndex)
			{
				case 1:
					back2Countdown(mins, secs);
					break;
				default:
					break;
			}
		});
};

function back2Countdown(mins, secs) {
	$.mobile.loading("show");
	$.when($.mobile.changePage('#countdown_page')).done(startCountdown(mins, secs));
	//$.mobile.loading("hide");
};

function notifyUser() {
	navigator.notification.beep(2);
	navigator.notification.vibrate(2000);
};