$(function(){
	TweenMax.set( $('#bg'), { backgroundImage: 'url(img/00' + Math.ceil(Math.random() * 4) + '.jpg)', opacity: 0 } );	
	TweenMax.set( $('#content img'), { opacity: 0, y: '250px' } );	
	TweenMax.set( $('#content p'), { opacity: 0, y: '250px' } );	
	TweenMax.to( $('#bg'), 0.75, { opacity: 1, ease: Expo.easeOut, delay: 0.5 } );
	TweenMax.to( $('#content img'), 0.75, { opacity: 1, y: 0, ease: Expo.easeOut, delay: 0.75 } );
	TweenMax.to( $('#content p'), 0.75, { opacity: 1, y: 0, ease: Expo.easeOut, delay: 0.85 } );

});