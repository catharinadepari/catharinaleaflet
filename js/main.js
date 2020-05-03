// 1. Create a map object where the U.S. coordinates are 39.38 Lat and -97.92 Long
var mymap = L.map('map', {
    center: [39.38, -97.92],
    zoom: 7,
    maxZoom: 10,
    minZoom: 3,
    detectRetina: true});

// 2. Add a tileLayer to add a base map.
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add airports' air traffic control towers GeoJSON Data
// Null variable that will hold cell tower data
var controlTowers = null;

// 4. Build up a set of colors from colorbrewer's dark2 category
// there are 2 classes of airport will be represented here,
// those with traffic control tower and those wthout it.
// There are 940 airports distributed in the 52 states
// (505 with control towers; 435 without it)
var colors = chroma.scale('Spectral').mode('lch').colors(2);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 2; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

// Get GeoJSON and put on it on the map when it loads
controlTowers= L.geoJson.ajax("assets/airports.geojson", {
    // assign a function to the on EachFeature parameter of the airport traffic control object.
    // Then each (point) feature will bind a popup window.
    // The content of the popup window is the value of `feature.properties.AIRPT_NAME`
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>Airport Name</h3>" + feature.properties.AIRPT_NAME + " " + "<h3>Passengers boarding by airlines</h3>" + feature.properties.TOT_ENP + "<h3>Elevation Above Sea Level</h3>" + feature.properties.ELEV);
    },
    pointToLayer: function (feature, latlng) {
        var id = 0;
        if (feature.properties.CNTL_TWR == "Y") { id = 0; }
        else if (feature.properties.CNTL_TWR == "N")  { id = 1; }
        return L.marker(latlng, {
          icon: L.divIcon({className: 'fa fa-plane marker-color-' + (id + 1).toString() })});
    },
    attribution: 'Air Traffic Control Towers Data &copy; US Government | US States Boundaries &copy; Mike Bostock of D3 | Base Map &copy; CartoDB | Made By Catharina Depari'
}).addTo(mymap);

// 6. Set function for color ramp for the traffic controls
// towers which cover between 1 and 191 airports for one state
colors = chroma.scale('OrRd').colors(7);
//alternative colors = chroma.scale('YlGnBu'), YlOrRd YlOrBr YlGnBu YlGn credits
// RdPu Purples PuRd OrRd Oranges Greys Greens GnBu BuPu BuGn Blues.colors(5);

function setColor(density) {
    var id = 0;
    if (density > 60) { id = 6; }
    else if (density > 50 && density <= 60) { id = 5; }
    else if (density > 40 && density <= 50) { id = 4; }
    else if (density > 30 && density <= 40) { id = 3; }
    else if (density > 20 && density <= 30) { id = 2; }
    else if (density > 10 && density <= 20) { id = 1; }
    else  { id = 0; }
    return colors[id];
}

// 7. Set style function that sets fill color.md property
// equal to airport density
function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.4,
        weight: 2,
        opacity: 1,
        color: '#b4b4b4',
        dashArray: '4'
    };
}

// 8. Add county polygons
// create counties variable, and assign null to it.
var counties = null;
counties = L.geoJson.ajax("assets/us-states.geojson", {
    style: style
}).addTo(mymap);

// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b># Airport</b><br />';
    div.innerHTML += '<i style="background: ' + colors[6] + '; opacity: 0.5"></i><p>60+</p>';
    div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>51-60</p>';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>41-50</p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>31-40</p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>21-30</p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p>11-20</p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p>0-10</p>';
    div.innerHTML += '<hr><b>Traffic Control Tower<b><br />';
    div.innerHTML += '<i class="fa fa-plane marker-color-1"></i><p>Available</p>';
    div.innerHTML += '<i class="fa fa-plane marker-color-2"></i><p>Not Available</p>';
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);
