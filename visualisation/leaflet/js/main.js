//Code modified from Wellcome Trust Women's Work project: https://github.com/wellcometrust/womens-work/tree/master/visualisations/map

////////////////////////////////////////////////////////////////

var highlightColor = '#a9fcff';
var selectedColor = '#f442dc';

// For interactive map
var disableClusterZoomLevel = 8;
var markerOpacity = 0.35;

function initMap() {
	$.getJSON("data/leaflet_markers.json", makeMap);
}

function makeMap(data) {
    ////////////// Map Parameters //////////////
    var centreLatitude = 51.5;
    var centreLongitude = -0.12;
    var initialZoom = 10;

    var map = L.map('map', {
        zoomControl:true,
        maxZoom: 12,
        minZoom: 8,
    }).setView([centreLatitude, centreLongitude], initialZoom);


    // add basemap url here
    var mbUrl = ''

    var darkMap = L.tileLayer(mbUrl).addTo(map);
    // getting data to transform current borough to MOH
    var boroughToMoh = {}
    $.getJSON("data/moh_smell_category_borough_json.json",function(boroughToMohFromServer){
        boroughToMoh = boroughToMohFromServer;
        console.log(boroughToMoh)
    });
    $.getJSON("data/london_districts_latlong_with_centroids.json",function(borough_outlines){
        boroughLayer = L.geoJson( borough_outlines, {
          style: function(feature){
            return {
                color: "white",
                weight: 1,
                fillColor: 'none',
                fillOpacity: 0 };
            }
        }).addTo(map);
    });

    radiusScale = d3.scale.sqrt().domain([1, 20]).range([20, 40])
    //numbersmellsradiusScale = d3.scale.sqrt().domain([1, 20]).range([0, 20])

    function radius(total_number_smells){
        return radiusScale(total_number_smells)
    }

    allmarkers = new L.layerGroup();

    for (var i=0; i<data.length; i++) {
        var d = data[i];
        d.centroid_lat = parseFloat(d.centroid_lat);
        d.centroid_lon = parseFloat(d.centroid_lon);

        var marker = L.piechartMarker(new L.LatLng(d.centroid_lat, d.centroid_lon), {
            radius: radius(d.total_smells_location_year),
            data: d.smells,
            time: d.formatted_year
            //color: highlightColor,
            //fillOpacity: markerOpacity,
        });

        var tooltipContentDiv;
        function tooltipContent(){
            tooltipContentDiv = '<h2 id="tooltipContentDiv" class="tooltipTitle">Borough: '+d.location_name+'</h2>'+
                                '<p id="tooltipContentDiv" class="tooltipDescription">Records: '+ d.total_smells_location_year+'</p>';

            return tooltipContentDiv;
        }

        marker.data = d;

        marker.on('click', function(e){
          var d = e.target.data;
            // marker.setStyle({color:'blue'})
            // e.target.setStyle({color:selectedColor})
            $('#map-info').css('opacity', '0.9');
            $('#map-info').html(function(){
                var title = d.location_name + ' ' + d.formatted_year.substr(0, 4);
                var sidebarContent = '<h1 id="tooltipContentDiv">'+title+'</h1>';
                var mohs = boroughToMoh[title]
                //console.log(boroughToMoh, d.location_name + ' ' + d.formatted_year);
                //console.log('mohs=', mohs);

                //if (moh.length > 0) {
                    // notes: create the dropdown with sub authorities
                    //sidebarContent += '<select name="select">'
                    //for (var i=0; i < moh.length; i++) {
                        //var subAuthority = moh[i];
                        //sidebarContent += '<option>'+ moh.name +"</option>";
                    //};
                    //sidebarContent += '</select>'

                    // notes: smells per authority
                    for (var mohName in mohs) {
                        var moh = mohs[mohName];
                        console.log("mohName=", mohName)

                        sidebarContent +=
                        '<p>' +
                          '<a href="http://wellcomelibrary.org/item/'+moh.bID+'" target="_blank">'+
                          mohName+
                          '</a>' +
                        '</p>';
                        for (var m=0; m < moh.smells.length; m++) {
                            console.log(moh.smells[m])
                            sidebarContent +=
                                "<h2>Smell: "+ (moh.smells[m].cat) +"</h2>"+
                                "<p>Reported "+moh.smells[m].count+" times</p>";

                        };
                    }
                //}



                return sidebarContent;
            });
        })

        marker.on('popupclose', function(e){
            // e.target.setStyle({color:highlightColor})
        })
        marker.bindPopup(tooltipContent());

        allmarkers.addLayer(marker);
    }
    // map.addLayer(allmarkers); // It's the slider showing them

    // Animation - time slider
    sliderControl = L.control.sliderControl({
        position: "topright",
        layer: allmarkers,
        timeStrLength: 4,
        follow: 3 // displays markers only at specific timestamp
    });
    //Make sure to add the slider to the map ;-)
    map.addControl(sliderControl);
    // Initialize the slider
    sliderControl.startSlider();

    // Define base map layers
    var baseMaps = {
        "All": allmarkers
    };

    layer_names = ["All"];
    layer_urls = [allmarkers];

    var overlayMaps = {};
    for (i=0; i<layer_names.length; i++) {
        var layer_name = layer_names[i];
        var overlayLayer = layer_urls[i];
        overlayDiv = ('<span style="width: 10px; ' +
        'height: 10px; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; border: 1px solid #FFF; float: left; margin-right: 0px; margin-left: 0px;' +
        'margin-top: 3px;"></span>' + layer_name);
        overlayMaps[overlayDiv] = overlayLayer;
    }

    // Add controls
    L.control.layers(
        baseMaps, null, {collapsed:false, position:"bottomleft"}
    ).addTo(map);

    // Add legend title
    jQuery(function($){$('.leaflet-control-layers-expanded').prepend(
        '<h3 style="color:white"; margin-top:0px !important>' + 'Layers' + '</h3>');
    });

}
