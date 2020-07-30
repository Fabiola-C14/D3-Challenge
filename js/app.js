function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = 1000;
    var svgHeight = 700;
  
    var margin = {
        top: 20,
        right: 40,
        bottom: 90,
        left: 90
    };
  
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
  
    // Append SVG element
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth);

    // Append group element
    var scatterGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
      //Initial Params
    var chosenXAxis = "poverty"
    var chosenYAxis = "healthcare"  

    function xScale(healthData, chosenXAxis) {
        //create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[chosenXAxis]) *0.8,
            d3.max(healthData, d => d[chosenXAxis])*1.2])
            .range([0, width]);
        
        return xLinearScale;
    }

    function yScale(healthData, chosenYAxis) {
        //create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
            d3.max(healthData, d => d[chosenYAxis])*1.2])
            .range([height, 0]);
        
        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
  
        xAxis.transition()
            .duration(700)
            .call(bottomAxis);
  
    return xAxis;
    }
    
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
  
        yAxis.transition()
            .duration(700)
            .call(leftAxis);
  
    return yAxis;
    }
    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(500)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
    }

    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
        .duration(700)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]))
        .attr("text-anchor", "middle");
    
        return textGroup;
    }
    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        //select x label
        //poverty percentage
        if (chosenXAxis === 'poverty') {
            var xLabel = "Poverty:";
        }
        //household income in dollars
        else if (chosenXAxis === 'income') {
            var xLabel = "Median Income:";
        }
        //age (number)
        else {
            var xLabel = "Age:";
        }

        //select y label
        //percentage lacking healthcare
        if (chosenYAxis === 'healthcare') {
            var yLabel = "No Healthcare:"
        }
        //percentage obese
        else if (chosenYAxis === 'obesity') {
            var yLabel = "Obesity:"
        }
        //smoking percentage
        else {
            var yLabel = "Smokers:"
        }

        //create tooltip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis], chosenXAxis}<br>${yLabel} ${d[chosenYAxis]}%`);
            });

        circlesGroup.call(toolTip);

        //add events
        circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

        return circlesGroup;
    }

    // Read CSV
    d3.csv("data/data.csv").then(function(healthData) {
  
        // parse data
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });
  
        // create scales
        var xLinearScale = xScale(healthData, chosenXAxis);
        var yLinearScale = yScale(healthData, chosenYAxis);
  
        // create axes
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale)
  
        // append axes
        var xAxis = scatterGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
  
        var yAxis=scatterGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // append circles
        var circlesGroup = scatterGroup.selectAll("stateCircle")
          .data(healthData)
          .enter()
          .append("circle")
          .classed("stateCircle", true)
          .attr("cx", d => xLinearScale(d[chosenXAxis]))
          .attr("cy", d => yLinearScale(d[chosenYAxis]))
          .attr("r", "15")
          .attr("opacity", ".75");
        
        var textGroup = scatterGroup.selectAll("stateText")
            .data(healthData)    
            .enter()
            .append("text")
            .classed("stateText",true)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
            .text(d => (d.abbr))
            .attr("class", "text")
            .attr("text-anchor", "middle")
            .attr("fill", "white");

        // Create group for three x-axis labels
        var xLabelsGroup = scatterGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("class","axis-text-x")
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Poverty (%)");
        
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("class","axis-text-x")
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("class","axis-text-x")
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");
        
        // Create group for three x-axis labels
        var yLabelsGroup = scatterGroup.append("g")
        .attr("transform", `translate(-25, ${height/2})`);

        // append y axis
        var healthcareLabel=yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", 0)
            .attr("value", "healthcare")
            .attr("dy", "1em")
            .attr("class","axis-text-y")
            .classed("axis-text", true)
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel=yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("value", "smokes")
            .attr("dy", "1em")
            .attr("class","axis-text-y")
            .classed("inactive", true)
            .text("Smokes (%)");
        
        var obesityLabel=yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -70)
            .attr("value", "obesity")
            .attr("dy", "1em")
            .attr("class","axis-text-y")
            .classed("inactive", true)
            .text("Obese (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
            
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // updates x scale for new data
                    xLinearScale = xScale(healthData, chosenXAxis);
            
                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            
                    //Update text with New Values
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }

            }
            
        yLabelsGroup.selectAll(".axis-text-y")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
            
                    // replaces chosenXAxis with value
                    chosenYAxis = value;

                    // updates x scale for new data
                    yLinearScale = yScale(healthData, chosenYAxis);
            
                    // updates x axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            
                    //Update text with New Values
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                     smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive",true );
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

            }
        });    

    });
           
    }).catch(function(error) {
        console.log(error);
    });
  }
  
  // When the browser loads, makeResponsive() is called.
  makeResponsive();
  
  // When the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);
