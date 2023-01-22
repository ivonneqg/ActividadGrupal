var width = 1200;
var height= 600;
//
var svg = d3.select("body")
            .append("svg")
            .attr("width",width)
            .attr("height",height)

// Proyeccion
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 1 / Math.PI)
    .translate([width / 1.7, height / 5.2]);
var path = d3.geoPath()
    .projection(projection);

// Datos y escala de color
var data = d3.map();
var colorScheme = d3.schemeBlues[6];
colorScheme.unshift("#eee");
var colorScale = d3.scaleThreshold()
    .domain([1 , 6, 11, 26, 101, 1001])
    .range(colorScheme);

// Legenda
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(60,60)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("PBI");
var labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '>1000'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(10)
    .scale(colorScale);
    svg.select(".legendThreshold")
    .call(legend);

// Cargar datos
d3.queue()
    //.defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.json, "paisessud.json")
    .defer(d3.csv, "datapaises.csv", function(d) { data.set(d.id, d); })
    .await(ready);

// Crear el tooltip
var tooltip = d3.select("body")
                .append("div")
                .attr('class', 'hidden tooltip');

function ready(error, topo) {
    if (error) throw error;

    // Dibujar el mapa
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
            .attr("fill", function (d){
                // Coger data para este pais
                d.total = data.get(d.id).pib || 0;
                // Establecer el color
                return colorScale(d.total);
            })
            .attr("d", path)
            .on('mousemove', function(d) {
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });
                d.poblacion = data.get(d.id).poblacion || 0;
                d.pais = data.get(d.id).pais || 0;
                d.capital = data.get(d.id).capital || 0;
                d.moneda = data.get(d.id).moneda || 0;
        d.mujeres = data.get(d.id).mujeres || 0;
        d.hombres = data.get(d.id).hombres || 0;
                tooltip.classed('hidden', false)
                    .attr('style', 'left:' + (mouse[0] + 15) +'px; top:' + (mouse[1] - 35) + 'px')
                    .html("<b>"+d.pais+"</b>"+"<br>Capital: "+d.capital+"<br>Moneda: " + d.moneda+ "<br>Población: " + d.poblacion + "<br>-Mujeres: " + d.mujeres + "<br>-Hombres: " + d.hombres);
            })
            .on('mouseout', function() {
                tooltip.classed('hidden', true);
            });
}
