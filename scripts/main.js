// create map object with initial view and zoom level
var map = L.map('map').setView([38, -95], 4);

//// add basemap layer to map
var base_carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd'}
).addTo(map);

var base_gg = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains: ['mt0','mt1','mt2','mt3']
});


//// add precipitation radar layer to map
/*
Title: NEXRAD Base Reflectivity Current
Layer type: OGC Web Map Service
Summary: A National Weather Service image product depicting current precipitation derived from a network of radar stations. The web service is provided by Iowa State University Mesonet.
https://mesonet.agron.iastate.edu/ogc/
*/

var radarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi';
var radarDisplayOptions = {
  layers: 'nexrad-n0r-900913',
  format: 'image/png',
  transparent: true
};
var precipitation = L.tileLayer.wms(radarUrl, radarDisplayOptions).addTo(map);


//// add weather alerts layer to map
/*
Weather alerts
Title: National Weather Service Active Alerts
Layer type: GeoJSON
Summary: Areas under a weather alert issued by the National Weather Service, such as a tornado warning. See the NWS for details on the API.
https://www.weather.gov/documentation/services-web-api#/default/get_alerts_active
*/

// create empty layer to store JSON data from JQuery request
// this is a workaround to add a GeoJSON layer from AJAX through jQuery
// to leaflet layer control
var weatherAlerts = L.layerGroup().addTo(map);

// use JQuery function to request data in JSON format
var weatherAlertsUrl = 'https://api.weather.gov/alerts/active?region_type=land';

$.getJSON(weatherAlertsUrl, function(data) {
  L.geoJSON(data,{
    // style alert polygon based on severity
    style: function (feature) {
      var color = 'orangered';
      var fillColor = 'darkorange';
      var opacity = 0.5;
      if (feature.properties.severity === 'Severe') {
        color ='darkred';
        fillColor ='crimson';
        opacity = 0.8;
      }
      return { color: color, weight: 2, fillColor: fillColor, 
        fillOpacity: opacity}
    },
    onEachFeature: function(feature, layer) {
      // add popup with alert details when clicked
      layer.bindPopup(feature.properties.headline);
      // add every feature found in JSON data to weatherAlerts layer
      weatherAlerts.addLayer(layer);
    }
  });
});


// add popup with coordinates when clicked
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(e.latlng.lat.toFixed(6).toString() + ', ' +
        e.latlng.lng.toFixed(6).toString())
        .openOn(map);
}

map.on('click', onMapClick);


//// add layers control
// create control object 
var baseLayers = {
  'CartoDB Light': base_carto,
  'Google Satellite': base_gg
};

var overlayMaps = {
  'Precipitation': precipitation,
  'Weather Alerts': weatherAlerts
};
// add layers control to map
var layersControl = L.control.layers(baseLayers, overlayMaps).addTo(map);

// add scale control to map
L.control.scale().addTo(map);


//// add info button
var infoBox = document.getElementById('infoBox');
infoBox.style.display = 'none'
L.easyButton('<span>&#8505;</span>', function(){
  // Toggle the display of the info box
  if(infoBox.style.display == 'none') {
    infoBox.style.display = 'block';
  } else {
    infoBox.style.display = 'none';
  }
}).addTo(map);

