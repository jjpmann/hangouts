<html>
<head>
	<title>Hangouts War</title>
	<link rel="stylesheet" type="text/css" href="//hangouts.jjpmann.com/css/style.css">
	<script src="//plus.google.com/hangouts/_/api/v1/hangout.js" ></script>
</head>

<body>

	<div id="page_main">

		<div class="players">
			<div id="waiting"> <p class="msg">Waiting for users to join.</p></div>
			<ul></ul>
		</div>

		<div id="start" class="-hide">
			<a href="#start">Start</a>
		</div>

		<div id="game">

			<h2>War!</h2>

			<div id="main">

				<button id="btn_play">Play</button><button id="btn_deal">Deal</button>

				<div id="deck"></div>

				<div id="play"></div>

				<div id="hands"></div>

			</div>

		</div>

	</div>

	<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script src="//hangouts.jjpmann.com/js/script.js"></script>

</body>
</html>