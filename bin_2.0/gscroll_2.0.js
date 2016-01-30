/*GScroll Version:2.0 Author:EchoSoar WebSite:http://iwenku.net/project/gscroll/ */
function gscroll(id,config){
	if(!config){
		var config={};
	}
	var GSCROLL=this;
	var isDragBar=false;
	var startDragPos=null;
	var startDragBarPos=null;
	var touchX=0;
	var touchY=0;
	var GSconfig={
		orientation:config.orientation?config.orientation=='horizontal'?'horizontal':"vertical":"vertical",//default:vertical,horizontal;
		bgWidth:config.bgWidth?config.bgWidth:"4px",
		barWidth:config.barWidth?config.barWidth:"4px",
		bgColor:config.bgColor?config.bgColor:"#333",
		barColor:config.barColor?config.barColor:"#c93",
		bgAlpha:config.bgAlpha?config.bgAlpha>1?1:config.bgAlpha:1,
		barAlpha:config.barAlpha?config.barAlpha>1?1:config.barAlpha:1,
		bgRadius:config.bgRadius?config.bgRadius>0.5?0.5:config.bgRadius:0.5,
		barRadius:config.barRadius?config.barRadius>0.5?0.5:config.barRadius:0.5,
		moveSpeed:config.moveSpeed?config.moveSpeed<1?1:config.moveSpeed:5,
		autoHidden:config.autoHidden===false?false:true
	}
	
	var context=document.getElementById(id);
	var contentText=context.innerHTML;
	context.style.padding="0";
	var contextWidth=context.offsetWidth;
	var contextHeight=context.offsetHeight;
	
	var temNode=document.createElement("div");
	temNode.setAttribute("id",id+"_gscroll_contain");
	temNode.style.position="relative";
	temNode.style.height=contextHeight+"px";
	temNode.style.overflow="hidden";
	context.style.overflow="hidden";
	context.innerHTML="";
	context.appendChild(temNode);
	
	var contain=document.getElementById(id+"_gscroll_contain");
	
	var temContentNode=document.createElement("div");
	temContentNode.setAttribute("id",id+"_gscroll_content");
	temContentNode.style.position="absolute";
	temContentNode.style.zIndex=3;
	temContentNode.style.top="0px";
	temContentNode.style.left="0px";
	
	temContentNode.innerHTML=contentText;
	contain.appendChild(temContentNode);
	
	var content=document.getElementById(id+"_gscroll_content");
	
	if(GSconfig.orientation=='vertical'){
		if(contextHeight>=parseFloat(content.offsetHeight))return;
	}else{
		if(contextWidth>=parseFloat(content.offsetWidth))return;
	}
	
	var Yscale=contextHeight/parseFloat(content.offsetHeight)*(contextHeight-10);
	var Xscale=contextWidth/parseFloat(content.offsetWidth)*(contextWidth-10);
	
	var temScrollBg=document.createElement("div");
		temScrollBg.style.position="absolute";
		temScrollBg.style.zIndex=4;
		temScrollBg.id=id+"_gscroll_bg";
		temScrollBg.style.filter = GSconfig.autoHidden?"alpha(opacity=0)":"alpha(opacity="+(GSconfig.bgAlpha*100)+")";
		temScrollBg.style.opacity =GSconfig.autoHidden?0:GSconfig.bgAlpha;
		temScrollBg.style.borderRadius=parseFloat(GSconfig.bgWidth)*GSconfig.bgRadius+"px";
		if(GSconfig.orientation=='vertical'){
			temScrollBg.style.top="5px";
			temScrollBg.style.right="5px";
			temScrollBg.style.width=GSconfig.bgWidth;
			temScrollBg.style.height=contextHeight-10+"px";
		}else{
			temScrollBg.style.bottom="5px";
			temScrollBg.style.left="5px";
			temScrollBg.style.height=GSconfig.bgWidth;
			temScrollBg.style.width=contextWidth-10+"px";
		}
		temScrollBg.style.backgroundColor=GSconfig.bgColor;
		contain.appendChild(temScrollBg);
		
	var GSbg=document.getElementById(id+"_gscroll_bg");
	
	function fadeIn(obj,target){
		clearInterval(obj.timer);
		var cur=obj.style.opacity*100,speed=6;
		obj.timer = setInterval(function(){
			if(cur<target){
				cur+=speed;
				obj.style.filter = "alpha(opacity="+cur+")";
				obj.style.opacity =cur/100;
			}else{
				obj.style.filter = "alpha(opacity="+target+")";
				obj.style.opacity =target/100;
				clearInterval(obj.timer);
			}
		},20);
	}
	function fadeOut(obj){
		clearInterval(obj.timer);
		var cur=obj.style.opacity*100,speed=6;
		obj.timer = setInterval(function(){
			if(cur>0){
				cur-=speed;
				obj.style.filter = "alpha(opacity="+cur+")";
				obj.style.opacity =cur/100;
			}else{
				obj.style.filter = "alpha(opacity=0)";
				obj.style.opacity =0;
				clearInterval(obj.timer);
			}
		},20);
	}
	function getMousePos(event) { 
      var e = event || window.event; 
      var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft; 
      var scrollY = document.documentElement.scrollTop || document.body.scrollTop; 
      var x = e.pageX || e.clientX + scrollX; 
      var y = e.pageY || e.clientY + scrollY; 
      return { 'x': x, 'y': y }; 
    }
	function getElementPos(e){
		function getTop(e){ 
			var offset=e.offsetTop; 
			if(e.offsetParent!=null) offset+=getTop(e.offsetParent); 
			return offset; 
		}
		function getLeft(e){ 
			var offset=e.offsetLeft; 
			if(e.offsetParent!=null) offset+=getLeft(e.offsetParent); 
			return offset; 
		}
		return { 'y': getTop(e), 'x': getLeft(e) }; 
	}
	function moveByDistance(distance){
		if(GSconfig.orientation=='vertical'){
			var scaleDistance=(distance-5)/(contextHeight-10)*parseFloat(content.offsetHeight);
			content.style.top=-scaleDistance+"px";
		}else{
			var scaleDistance=(distance-5)/(contextWidth-10)*parseFloat(content.offsetWidth);
			content.style.left=-scaleDistance+"px";
		}
	}
	function isOut(e){
		var temMousePos=getMousePos(e);
		var temElePos=getElementPos(contain);
		if(temMousePos.x-temElePos.x<0||temMousePos.y-temElePos.x<0||temMousePos.y-temElePos.y>parseFloat(contain.offsetHeight)||temMousePos.x-temElePos.x>parseFloat(contain.offsetWidth))return true;
		return false;
	}
	
	function move(obj,direction){
		if(obj.ismove&&obj.direction==direction){
			return;
		}
		clearInterval(obj.interval);
		obj.ismove=true;
		obj.direction=direction;
	
		if(direction=='up'){
			var from=parseFloat(obj.style.top);
			var to=from-GSconfig.moveSpeed*5;
			if(to<5){
				to=5;
			}
		}else if(direction=='down'){
			var from=parseFloat(obj.style.top);
			var to=from+GSconfig.moveSpeed*5;
			if(to>(contextHeight-5-Yscale)){
				to=contextHeight-5-Yscale;
			}
		}else if(direction=='left'){
			var from=parseFloat(obj.style.left);
			var to=from-GSconfig.moveSpeed*5;
			if(to<5){
				to=5;
			}
		}else if(direction=='right'){
			var from=parseFloat(obj.style.left);
			var to=from+GSconfig.moveSpeed*5;
			if(to>(contextWidth-5-Xscale)){
				to=contextWidth-5-Xscale;
			}
		}else{
			return;
		}
		
		obj.interval=setInterval(function(){
			if(direction=='up'){
				if(from>to){
					from-=GSconfig.moveSpeed/5;
					obj.style.top=from+"px";
					moveByDistance(from);
				}else{
					obj.ismove=false;
					clearInterval(obj.interval);
				}
			}else if(direction=='down'){
				if(from<to){
					from+=GSconfig.moveSpeed/5;
					obj.style.top=from+"px";
					moveByDistance(from);
				}else{
					obj.ismove=false;
					clearInterval(obj.interval);
				}
			}else if(direction=='left'){
				if(from>to){
					from-=GSconfig.moveSpeed/5;
					obj.style.left=from+"px";
					moveByDistance(from);
				}else{
					obj.ismove=false;
					clearInterval(obj.interval);
				}
			}else if(direction=='right'){
				if(from<to){
					from+=GSconfig.moveSpeed/5;
					obj.style.left=from+"px";
					moveByDistance(from);
				}else{
					obj.ismove=false;
					clearInterval(obj.interval);
				}
			}
		},20);
	}
	
	var temScrollBar=document.createElement("div");
		temScrollBar.style.position="absolute";
		temScrollBar.style.zIndex=5;
		temScrollBar.id=id+"_gscroll_bar";
		temScrollBar.style.filter = GSconfig.autoHidden?"alpha(opacity=0)":"alpha(opacity="+(GSconfig.barAlpha*100)+")";
		temScrollBar.style.opacity =GSconfig.autoHidden?0:GSconfig.barAlpha;
		temScrollBar.style.borderRadius=parseFloat(GSconfig.barWidth)*GSconfig.barRadius+"px";
		temScrollBar.style.cursor="pointer";
		if(GSconfig.orientation=='vertical'){
			temScrollBar.style.top="5px";
			temScrollBar.style.right=5+(parseFloat(GSconfig.bgWidth)-parseFloat(GSconfig.barWidth))/2+"px";
			temScrollBar.style.width=GSconfig.barWidth;
			temScrollBar.style.height=Yscale+"px";
		}else{
			temScrollBar.style.bottom=5+(parseFloat(GSconfig.bgWidth)-parseFloat(GSconfig.barWidth))/2+"px";
			temScrollBar.style.left="5px";
			temScrollBar.style.height=GSconfig.barWidth;
			temScrollBar.style.width=Xscale+"px";
		}
		temScrollBar.style.backgroundColor=GSconfig.barColor;
		contain.appendChild(temScrollBar);
	var GSbar=document.getElementById(id+"_gscroll_bar");
	
	contain.onmouseover=function(){
		if(GSconfig.autoHidden){fadeIn(GSbg,GSconfig.bgAlpha*100);fadeIn(GSbar,GSconfig.barAlpha*100);}
	}
	contain.onmouseout=function(e){
		if(isOut(e)){
			isDragBar=false;
		}
		if(GSconfig.autoHidden){fadeOut(GSbg);fadeOut(GSbar);}
	}
	GSbar.onmousedown=function(e){
		startDragPos=getMousePos(e);
		startDragBarPos={x:parseFloat(GSbar.style.left),y:parseFloat(GSbar.style.top)};
		isDragBar=true;
	}
	contain.onmousemove=function(e){
		isOut(e);
		if(isDragBar){
			var temPos=getMousePos(e);
			if(GSconfig.orientation=='vertical'){
				var distance=startDragBarPos.y+temPos.y-startDragPos.y;
				if(distance>(contextHeight-5-Yscale)){
					distance=(contextHeight-5-Yscale);
				}else if(distance<5){
					distance=5;
				}
				GSbar.style.top=distance+"px";
				moveByDistance(distance);
			}else{
				var distance=startDragBarPos.x+temPos.x-startDragPos.x;
				if(distance>(contextWidth-5-Xscale)){
					distance=(contextWidth-5-Xscale);
				}else if(distance<5){
					distance=5;
				}
				GSbar.style.left=distance+"px";
				moveByDistance(distance);
			}
		}
	}
	contain.onmouseup=function(){
		isDragBar=false;
	}
	GSbar.onselectstart=contain.onselectstart=function(){
		if(isDragBar){return false}
	};
	
	if (contain.addEventListener) {
        contain.addEventListener('DOMMouseScroll', function(event) {
            event.stopPropagation();
            event.preventDefault();
			if(event.detail<0){
				if(GSconfig.orientation=='vertical'){
					move(GSbar,"up");
				}else{
					move(GSbar,"left");
				}
			}else{
				if(GSconfig.orientation=='vertical'){
					move(GSbar,"down");
				}else{
					move(GSbar,"right");
				}
			}
        }, false);
    }
	contain.onmousewheel=function(e){
		var e=e||window.event;
		if (e.preventDefault)
			e.preventDefault();
		e.returnValue = false;  
		var event=e.wheelDelta||-e.detail;
		if(event>0){
			if(GSconfig.orientation=='vertical'){
				move(GSbar,"up");
			}else{
				move(GSbar,"left");
			}
		}else{
			if(GSconfig.orientation=='vertical'){
				move(GSbar,"down");
			}else{
				move(GSbar,"right");
			}
		}
	}
	
	contain.ontouchstart=function(e){
		e.preventDefault();
		e.stopPropagation();
		
		startDragBarPos={x:parseFloat(GSbar.style.left),y:parseFloat(GSbar.style.top)};
		var touch = e.touches[0]; 
        touchX = Number(touch.pageX);
        touchY = Number(touch.pageY); 
		if(GSconfig.autoHidden){fadeIn(GSbg,GSconfig.bgAlpha*100);fadeIn(GSbar,GSconfig.barAlpha*100);}
	}
	
	contain.ontouchmove=function(e){
		e.preventDefault();
		var touch = e.touches[0]; 
        var temtouchX = Number(touch.pageX);
        var temtouchY = Number(touch.pageY); 
		
		if(GSconfig.orientation=='vertical'){
			var distance=startDragBarPos.y-temtouchY+touchY;
				if(distance>(contextHeight-5-Yscale)){
					distance=(contextHeight-5-Yscale);
				}else if(distance<5){
					distance=5;
				}
			GSbar.style.top=distance+"px";
			moveByDistance(distance);
		}else{
			var distance=startDragBarPos.x-temtouchX+touchX;
				if(distance>(contextWidth-5-Xscale)){
					distance=(contextWidth-5-Xscale);
				}else if(distance<5){
					distance=5;
				}
			GSbar.style.left=distance+"px";
			moveByDistance(distance);
		}
	}
	
	contain.ontouchend=function(e){
		e.preventDefault();
		touchX=0;
		touchY=0;
		if(GSconfig.autoHidden){fadeOut(GSbg);fadeOut(GSbar);}
	}
}