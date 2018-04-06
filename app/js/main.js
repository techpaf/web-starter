$(function(){
	console.log('Ready');

	let slider = new LightSlider({
		debug: true,
		indicator: true,
		responsive: [
		{
			breakpoint: 767,
			settings: {
				touch: true,
				arrows: false,
				dots: true,
				adaptHeight: true,
				keyboard: false,
				indicator: false
			}
		}
		]
	});
});