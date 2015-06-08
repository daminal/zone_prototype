var Dot, Info, Line, Pen, Polygon, PolygonCreator;

$(function(){
	  //create map. Calls on PolygonCreator. 
	 map = new google.maps.Map(document.getElementById('main-map'), {
	  	zoom: 10,
	  	center: new google.maps.LatLng(40.4503037,-79.9503596),
	  	mapTypeId: google.maps.MapTypeId.ROADMAP
	  });
	 
	 var creator = new PolygonCreator(map);
	 
	 //reset
	 $('#reset').click(function(){ 
	 		creator.destroy();
	 		creator=null;
	 		creator=new PolygonCreator(map);
	 });		 
	 
	 
	 //show paths
	 $('#showData').click(function(){ 
	 		$('#dataPanel').empty();
	 		if(null===creator.showData()){
	 			$('#dataPanel').append('Please first create a polygon');
	 		}else{
	 			$('#dataPanel').append(creator.showData());
	 		}
	 });
});
//Creates polygon. Calls on Pen, initializes map?
PolygonCreator = function(map) {
  var thisOjb;
  this.map = map;
  this.pen = new Pen(this.map);
  thisOjb = this;
  this.event = google.maps.event.addListener(thisOjb.map, 'click', function(event) {
    thisOjb.pen.draw(event.latLng);
  });
  this.showData = function() {
    return this.pen.getData();
  };
  this.destroy = function() {
    this.pen.deleteMis();
    if (null !== this.pen.polygon) {
      this.pen.polygon.remove();
    }
    google.maps.event.removeListener(this.event);
  };
};

//
Pen = function(map) {
  this.map = map;
  this.listOfDots = new Array;
  this.polyline = null;
  this.polygon = null;
  this.currentDot = null;
  this.draw = function(latLng) {
    var dot;
    if (null !== this.polygon) {
      alert('Click Reset to draw another');
    } else {
      if (this.currentDot !== null && this.listOfDots.length > 1 && this.currentDot === this.listOfDots[0]) {
        this.drawPloygon(this.listOfDots);
      } else {
        if (null !== this.polyline) {
          this.polyline.remove();
        }
        dot = new Dot(latLng, this.map, this);
        this.listOfDots.push(dot);
        if (this.listOfDots.length > 1) {
          this.polyline = new Line(this.listOfDots, this.map);
        }
      }
    }
  };
  this.drawPloygon = function(listOfDots, color, des, id) {
    this.polygon = new Polygon(listOfDots, this.map, this, color, des, id);
    this.deleteMis();
  };
  this.deleteMis = function() {
    $.each(this.listOfDots, function(index, value) {
      value.remove();
    });
    this.listOfDots.length = 0;
    if (null !== this.polyline) {
      this.polyline.remove();
      this.polyline = null;
    }
  };
  this.cancel = function() {
    if (null !== this.polygon) {
      this.polygon.remove();
    }
    this.polygon = null;
    this.deleteMis();
  };
  this.setCurrentDot = function(dot) {
    this.currentDot = dot;
  };
  this.getListOfDots = function() {
    return this.listOfDots;
  };
  this.getData = function() {
    var data, paths;
    if (this.polygon !== null) {
      data = '';
      paths = this.polygon.getPlots();
      paths.getAt(0).forEach(function(value, index) {
        data += value.toString();
      });
      return data;
    } else {
      return null;
    }
  };
  this.getColor = function() {
    var color;
    if (this.polygon !== null) {
      color = this.polygon.getColor();
      return color;
    } else {
      return null;
    }
  };
};

Dot = function(latLng, map, pen) {
  this.latLng = latLng;
  this.parent = pen;
  this.markerObj = new google.maps.Marker({
    position: this.latLng,
    map: map
  });
  this.addListener = function() {
    var parent, thisDot, thisMarker;
    parent = this.parent;
    thisMarker = this.markerObj;
    thisDot = this;
    google.maps.event.addListener(thisMarker, 'click', function() {
      parent.setCurrentDot(thisDot);
      parent.draw(thisMarker.getPosition());
    });
  };
  this.addListener();
  this.getLatLng = function() {
    return this.latLng;
  };
  this.getMarkerObj = function() {
    return this.markerObj;
  };
  this.remove = function() {
    this.markerObj.setMap(null);
  };
};

Line = function(listOfDots, map) {
  var thisObj;
  this.listOfDots = listOfDots;
  this.map = map;
  this.coords = new Array;
  this.polylineObj = null;
  if (this.listOfDots.length > 1) {
    thisObj = this;
    $.each(this.listOfDots, function(index, value) {
      thisObj.coords.push(value.getLatLng());
    });
    this.polylineObj = new google.maps.Polyline({
      path: this.coords,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    });
  }
  this.remove = function() {
    this.polylineObj.setMap(null);
  };
};

Polygon = function(listOfDots, map, pen, color) {
  var thisObj;
  this.listOfDots = listOfDots;
  this.map = map;
  this.coords = new Array;
  this.parent = pen;
  this.des = 'Hello';
  thisObj = this;
  $.each(this.listOfDots, function(index, value) {
    thisObj.coords.push(value.getLatLng());
  });
  this.polygonObj = new google.maps.Polygon({
    paths: this.coords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: this.map
  });
  this.remove = function() {
    this.info.remove();
    this.polygonObj.setMap(null);
  };
  this.getContent = function() {
    return this.des;
  };
  this.getPolygonObj = function() {
    return this.polygonObj;
  };
  this.getListOfDots = function() {
    return this.listOfDots;
  };
  this.getPlots = function() {
    return this.polygonObj.getPaths();
  };
  this.getColor = function() {
    return this.getPolygonObj().fillColor;
  };
  this.setColor = function(color) {
    return this.getPolygonObj().setOptions({
      fillColor: color,
      strokeColor: color,
      strokeWeight: 2
    });
  };
  this.info = new Info(this, this.map);
  this.addListener = function() {
    var info, thisPolygon;
    info = this.info;
    thisPolygon = this.polygonObj;
    google.maps.event.addListener(thisPolygon, 'rightclick', function(event) {
      info.show(event.latLng);
    });
  };
  this.addListener();
};

Info = function(polygon, map) {
  var thisObj, thisOjb;
  this.parent = polygon;
  this.map = map;
  this.color = document.createElement('input');
  this.button = document.createElement('input');
  $(this.button).attr('type', 'button');
  $(this.button).val('Change Color');
  thisOjb = this;
  this.changeColor = function() {
    thisOjb.parent.setColor($(thisOjb.color).val());
  };
  this.getContent = function() {
    var content;
    content = document.createElement('div');
    $(this.color).val(this.parent.getColor());
    $(this.button).click(function() {
      thisObj.changeColor();
    });
    $(content).append(this.color);
    $(content).append(this.button);
    return content;
  };
  thisObj = this;
  this.infoWidObj = new google.maps.InfoWindow({
    content: thisObj.getContent()
  });
  this.show = function(latLng) {
    this.infoWidObj.setPosition(latLng);
    this.infoWidObj.open(this.map);
  };
  this.remove = function() {
    this.infoWidObj.close();
  };
};