const key = map_key;

const attribution = new ol.control.Attribution({
  collapsible: false,
});

const source = new ol.source.TileJSON({
  url: `https://api.maptiler.com/maps/basic-v2/tiles.json?key=${key}`, // source URL
  tileSize: 512,
  crossOrigin: "anonymous",
});

const map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: source,
    }),
  ],
  controls: ol.control.defaults
    .defaults({ attribution: false })
    .extend([attribution]),
  target: "map",
  view: new ol.View({
    constrainResolution: true,
    center: ol.proj.fromLonLat(Coordinates), // starting position [lng, lat]
    zoom: 14, // starting zoom
  }),
});

const marker = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: [
      new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(Coordinates)),
      }),
    ],
  }),
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: "https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_1280.png",
      anchor: [0.5, 1],
      scale: 0.04,
    }),
  }),
});
map.addLayer(marker);
