<html>
<head>
	<title>Hangouts War</title>
	<style><?php require_once('./css/style.css'); ?></style>
	<script src="https://hangoutsapi.talkgadget.google.com/hangouts/api/hangout.js?v=1.4" ></script>
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



		<!-- <div id="test">
			<a href="#" id="_one">Test One</a>
			<a href="#" id="_two">Test Two</a>
			<a href="#" id="_three">Test Three</a>
		</div>
 -->
		<div id="game">

			<h2>War!</h2>

			<div id="main">

				<button id="btn_play">Play</button><button id="clear">Clear</button><button id="info">Info</button>

				<div id="deck"></div>

				<div id="play"></div>

				<div id="hands">
<!-- 
					<div id="hand1" class="hand"></div>

					<div id="hand2" class="hand"></div>
 -->
 				</div>

			</div>

		</div>

	</div>

	<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script><?php require_once( './js/script.js' ); ?></script>

</body>
</html>