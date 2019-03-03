///////// line plotting

function plot_line(data_path){
var margin = {
    top: 20,
    right: 100,
    bottom: 30,
    left: 100
  },
  width = 900 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.time.scale()
  .range([0, width]);

var y = d3.scale.linear()
  .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var line = d3.svg.line()
  .interpolate("basis")
  .x(function(d) {
    return x(d.date);
  })
  .y(function(d) {
    return y(d.temperature);
  });

var svg = d3.select("#chart3").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv(data_path, function(error, data) {
  if (error) throw error;

color.domain(d3.keys(data[0]).filter(function(key) {
  return key !== "date";
}));
// console.log('hello run me');
  data.forEach(function(d) {
  d.date = parseDate(d.date);
  // console.log(parseDate(d.date));
  // console.log('hiya');
});

var cities = color.domain().map(function(name) {
  return {
    name: name,
    values: data.map(function(d) {
      return {
        date: d.date,
        temperature: +d[name]
      };
    })
  };
});

// console.log(cities)

x.domain(d3.extent(data, function(d) {
  return d.date;
}));

y.domain([
  d3.min(cities, function(c) {
    return d3.min(c.values, function(v) {
      return v.temperature;
    });
  }),
  d3.max(cities, function(c) {
    return d3.max(c.values, function(v) {
      return v.temperature;
    });
  })
]);

// var legend = svg.selectAll('g')
//   .data(cities)
//   .enter()
//   .append('g')
//   .attr('class', 'legend');
//
// legend.append('rect')
//   .attr('x', width - 20)
//   .attr('y', function(d, i) {
//     return i * 20;
//   })
//   .attr('width', 10)
//   .attr('height', 10)
//   .style('fill', function(d) {
//     return color(d.name);
//   });
//
// legend.append('text')
//   .attr('x', width - 8)
//   .attr('y', function(d, i) {
//     return (i * 20) + 9;
//   })
//   .text(function(d) {
//     return d.name;
//   });

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Loan Amount ($)");

var city = svg.selectAll(".city")
  .data(cities)
  .enter().append("g")
  .attr("class", "city");

city.append("path")
  .attr("class", "line")
  .attr("d", function(d) {
    return line(d.values);
  })
  .style("stroke", function(d) {
    return color(d.name);
  });

city.append("text")
  .datum(function(d) {
    return {
      name: d.name,
      value: d.values[d.values.length - 1]
    };
  })
  .attr("transform", function(d) {
    return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
  })
  .attr("x", 3)
  .attr("dy", ".35em")
  .text(function(d) {
    return d.name;
  });

var mouseG = svg.append("g")
  .attr("class", "mouse-over-effects");

mouseG.append("path") // this is the black vertical line to follow mouse
  .attr("class", "mouse-line")
  .style("stroke", "black")
  .style("stroke-width", "1px")
  .style("opacity", "0");

var lines = document.getElementsByClassName('line');

var mousePerLine = mouseG.selectAll('.mouse-per-line')
  .data(cities)
  .enter()
  .append("g")
  .attr("class", "mouse-per-line");

mousePerLine.append("circle")
  .attr("r", 7)
  .style("stroke", function(d) {
    return color(d.name);
  })
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("opacity", "0");

mousePerLine.append("text")
  .attr("transform", "translate(10,3)");

mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
  .attr('width', width) // can't catch mouse events on a g element
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mouseout', function() { // on mouse out hide line, circles and text
    d3.select(".mouse-line")
      .style("opacity", "0");
    d3.selectAll(".mouse-per-line circle")
      .style("opacity", "0");
    d3.selectAll(".mouse-per-line text")
      .style("opacity", "0");
  })
  .on('mouseover', function() { // on mouse in show line, circles and text
    d3.select(".mouse-line")
      .style("opacity", "1");
    d3.selectAll(".mouse-per-line circle")
      .style("opacity", "1");
    d3.selectAll(".mouse-per-line text")
      .style("opacity", "1");
  })
  .on('mousemove', function() { // mouse moving over canvas
    var mouse = d3.mouse(this);
    d3.select(".mouse-line")
      .attr("d", function() {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });

    d3.selectAll(".mouse-per-line")
      .attr("transform", function(d, i) {
        console.log(width/mouse[0])
        var xDate = x.invert(mouse[0]),
            bisect = d3.bisector(function(d) { return d.date; }).right;
            idx = bisect(d.values, xDate);

        var beginning = 0,
            end = lines[i].getTotalLength(),
            target = null;

        while (true){
          target = Math.floor((beginning + end) / 2);
          pos = lines[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
              break;
          }
          if (pos.x > mouse[0])      end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break; //position found
        }

        d3.select(this).select('text')
          .text(y.invert(pos.y).toFixed(2));

        return "translate(" + mouse[0] + "," + pos.y +")";
      });
  });
});
};



//////////////////// sundisk

function sundisk_plot(data_path){

// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "A": "#5e6ed9",
  "B": "#98b434",
  "C": "#55b74d",
  "D": "#c74ba8",
  "E": "#53af7e",
  "F": "#d94983",
  "G": "#3dbbb8",
  '< 1 year': "#d43d44",
  '10+ yrs': "#5e99d5",
  '2 years':   "#e18b39",
  '8 years':  "#7760a5",
  '1 year':   "#c7a73f",
  '9 years': "#ce8dcf",
  '7 years': "#53732e",
  '3 years':  "#9d4769",
  '4 years':  "#9bae66",
  '6 years':   "#c1552e",
  '5 years': "#a57840",
  '36 mo': "#55b74d",
  '60 mo': "#5e6ed9"

};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart2").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

  d3.json(data_path, function(error, json){
      if (error) throw error;
      createVisualization(json)
    });
// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      // .style("fill", d3.scale.category20())
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.name]; });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.2) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "left")
      .text(percentageString+" of loan applicants");

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}
}; // end of sandisk




///////// sankey //////////


d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8, // was 8, needs to be much bigger. these numbers are actually overwritten in the html when we instantiate the viz!
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();

    // big changes here
    // change the order and depths (y pos) won't need iterations
    computeNodeDepths();
    computeNodeBreadths(iterations);

    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

      // x0 = line start X
      // y0 = line start Y

      // x1 = line end X
      // y1 = line end Y

      // y2 = control point 1 (Y pos)
      // y3 = control point 2 (Y pos)

    function link(d) {

        // big changes here obviously, more comments to follow
        var x0 = d.source.x + d.sy + d.dy / 2,
            x1 = d.target.x + d.ty + d.dy / 2,
          y0 = d.source.y + nodeWidth,
          y1 = d.target.y,
          yi = d3.interpolateNumber(y0, y1),
          y2 = yi(curvature),
          y3 = yi(1 - curvature);

        // ToDo - nice to have - allow flow up or down! Plenty of use cases for starting at the bottom,
        // but main one is trickle down (economics, budgets etc), not up

      return "M" + x0 + "," + y0        // start (of SVG path)
           + "C" + x0 + "," + y2      // CP1 (curve control point)
           + " " + x1 + "," + y3      // CP2
           + " " + x1 + "," + y1;       // end
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // take a grouping of the nodes - the vertical columns
  // there shouldnt be 8 - there will be more, the total number of 1st level sources
  // then iterate over them and give them an incrementing x
  // because the data structure is ALL nodes, just flattened, don't just apply at the top level
  // then everything should have an X
  // THEN, for the Y
  // do the same thing, this time on the grouping of 8! i.e. 8 different Y values, not loads of different ones!
  function computeNodeBreadths(iterations) {
          var nodesByBreadth = d3.nest()
        .key(function(d) { return d.y; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; }); // values! we are using the values also as a way to seperate nodes (not just stroke width)?

      // this bit is actually the node sizes (widths)
      //var ky = (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
      // this should be only source nodes surely (level 1)
      var ky = (size[0] - (nodesByBreadth[0].length - 1) * nodePadding) / d3.sum(nodesByBreadth[0], value);
      // I'd like them to be much bigger, this calc doesn't seem to fill the space!?

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.x = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
          link.dy = link.value * ky;
      });

      resolveCollisions();

      for (var alpha = 1; iterations > 0; --iterations) {
        relaxLeftToRight(alpha);
        resolveCollisions();

        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
      }

      // these relax methods should probably be operating on one level of the nodes, not all!?

      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(function(nodes, breadth) {
            nodes.forEach(function(node) {
                if (node.targetLinks.length) {
                    var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                    node.x += (y - center(node)) * alpha;
                }
            });
        });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.x += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

      function resolveCollisions() {
        nodesByBreadth.forEach(function(nodes) {
            var node,
            dy,
            x0 = 0,
            n = nodes.length,
            i;

            // Push any overlapping nodes right.
            nodes.sort(ascendingDepth);
            for (i = 0; i < n; ++i) {
                node = nodes[i];
                dy = x0 - node.x;
                if (dy > 0) node.x += dy;
                x0 = node.x + node.dy + nodePadding;
            }

            // If the rightmost node goes outside the bounds, push it left.
            dy = x0 - nodePadding - size[0]; // was size[1]
            if (dy > 0) {
                x0 = node.x -= dy;

                // Push any overlapping nodes left.
                for (i = n - 2; i >= 0; --i) {
                    node = nodes[i];
                    dy = node.x + node.dy + nodePadding - x0; // was y0
                    if (dy > 0) node.x -= dy;
                        x0 = node.x;
                    }
                }
            });
        }

    function ascendingDepth(a, b) {
        //return a.y - b.y; // flows go up
        return b.x - a.x; // flows go down
        //return a.x - b.x;
    }
    }

  // this moves all end points (sinks!) to the most extreme bottom
  function moveSinksDown(y) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.y = y - 1;
      }
    });
  }

  // shift their locations out to occupy the screen
  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.y *= kx;
    });
  }

  function computeNodeDepths() {
        var remainingNodes = nodes,
        nextNodes,
        y = 0;

        while (remainingNodes.length) {
          nextNodes = [];
          remainingNodes.forEach(function(node) {
            node.y = y;
            //node.dx = nodeWidth;
            node.sourceLinks.forEach(function(link) {
              if (nextNodes.indexOf(link.target) < 0) {
                nextNodes.push(link.target);
              }
            });
          });
          remainingNodes = nextNodes;
          ++y;
        }

        // move end points to the very bottom
        moveSinksDown(y);

        scaleNodeBreadths((size[1] - nodeWidth) / (y - 1));
    }

  // .ty is the offset in terms of node position of the link (target)
  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
          //ty = node.dy;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
          // this is simply saying, for each target, keep adding the width of the link
          // so what if it was the other way round. start with full width then subtract?
        link.ty = ty;
        ty += link.dy;
        //ty -= link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      //return a.source.y - b.source.y;
        return a.source.x - b.source.x;
    }

    function ascendingTargetDepth(a, b) {
      //return a.target.y - b.target.y;
        return a.target.x - b.target.x;
    }
  }

  function center(node) {
      return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

var sankey_plot = function(data_path){
var margin = {top: 1, right: 1, bottom: 6, left: 1},
width = 1100 - margin.left - margin.right, // was 960
//height = 1500 - margin.top - margin.bottom; // was 500
height = 350; // UBS Example
var formatNumber = d3.format(",.0f"),
format = function(d) { return formatNumber(d); },
color = d3.scale.category20();
var svg = d3.select("#chart1").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var sankey = d3.sankey()
.nodeWidth(25) // was 15
.nodePadding(5) // was 10
.size([width, height]);
var path = sankey.link();
d3.json(data_path, function(energy) {
sankey
  .nodes(energy.nodes)
  .links(energy.links)
  .layout(16); // what is this? iterations
var link = svg.append("g").selectAll(".link")
  .data(energy.links)
.enter().append("path")
  .attr("class", "link")
  .attr("d", path)
  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
  .style("stroke", function(d) { return d.source.color = color(d.source.name.replace(/ .*/, "")); })
  .sort(function(a, b) { return b.dy - a.dy; });
link.append("title")
  .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });
  // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky

var node = svg.append("g").selectAll(".node")
  .data(energy.nodes)
.enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
  })
  .call(d3.behavior.drag()
  .origin(function(d) { return d; })
  .on("dragstart", function() { this.parentNode.appendChild(this); })
  .on("drag", dragmove));
node.append("rect")
  .attr("height", sankey.nodeWidth())
  .attr("width", function(d) { return d.dy; })
  .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
  .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
.append("title")
  .text(function(d) { return d.name + "\n" + format(d.value); });

node.append("text")
  .attr("text-anchor", "middle")
  .attr("x", function (d) { return d.dy / 2 })
  .attr("y", sankey.nodeWidth() / 2)
  .attr("dy", ".35em")
  .text(function(d) { return d.name; })
  .filter(function(d) { return d.x < width / 2; });

function dragmove(d) {
//d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
d3.select(this).attr("transform", "translate(" + (d.x = Math.max(0, Math.min(width - d.dy, d3.event.x))) + "," + d.y + ")");
sankey.relayout();
link.attr("d", path);
}
});
};
