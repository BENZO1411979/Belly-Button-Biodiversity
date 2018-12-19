function buildMetadata(sample) {
 // Reference to Panel element for sample metadata
 var PANEL = document.getElementById("sample-metadata");
 // Clear any existing metadata
 PANEL.innerHTML = '';
 // Loop through all of the keys in the json response and
 // create new metadata tags
 for(var key in data) {
     h6tag = document.createElement("h6");
     h6Text = document.createTextNode(`${key}: ${sample[key]}`);
     h6tag.append(h6Text);
     PANEL.appendChild(h6tag);
 }
  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

// function buildCharts(sample) {

  
// }
function buildCharts(sampleData, otuData) {
  // Loop through sample data and find the OTU Taxonomic Name
  var labels = sampleData[0]['otu_ids'].map(function(item) {
      return otuData[item]
  });
  // Build Bubble Chart
  var bubbleLayout = {
      margin: { t: 0 },
      hovermode: 'closest',
      xaxis: { title: 'OTU ID' }
  };
  var bubbleData = [{
      x: sampleData[0]['otu_ids'],
      y: sampleData[0]['sample_values'],
      text: labels,
      mode: 'markers',
      marker: {
          size: sampleData[0]['sample_values'],
          color: sampleData[0]['otu_ids'],
          colorscale: "Earth",
      }
  }];
  var BUBBLE = document.getElementById('bubble');
  Plotly.plot(BUBBLE, bubbleData, bubbleLayout);
  // Build Pie Chart
  console.log(sampleData[0]['sample_values'].slice(0, 10))
  var pieData = [{
      values: sampleData[0]['sample_values'].slice(0, 10),
      labels: sampleData[0]['otu_ids'].slice(0, 10),
      hovertext: labels.slice(0, 10),
      hoverinfo: 'hovertext',
      type: 'pie'
  }];
  var pieLayout = {
      margin: { t: 0, l: 0 }
  };
  var PIE = document.getElementById('pie');
  Plotly.plot(PIE, pieData, pieLayout);
};
function updateCharts(sampleData, otuData) {
  var sampleValues = sampleData[0]['sample_values'];
  var otuIDs = sampleData[0]['otu_ids'];
  // Return the OTU Description for each otuID in the dataset
  var labels = otuIDs.map(function(item) {
      return otuData[item]
  });
  // Update the Bubble Chart with the new data
  var BUBBLE = document.getElementById('bubble');
  Plotly.restyle(BUBBLE, 'x', [otuIDs]);
  Plotly.restyle(BUBBLE, 'y', [sampleValues]);
  Plotly.restyle(BUBBLE, 'text', [labels]);
  Plotly.restyle(BUBBLE, 'marker.size', [sampleValues]);
  Plotly.restyle(BUBBLE, 'marker.color', [otuIDs]);
  // Update the Pie Chart with the new data
  // Use slice to select only the top 10 OTUs for the pie chart
  var PIE = document.getElementById('pie');
  var pieUpdate = {
      values: [sampleValues.slice(0, 10)],
      labels: [otuIDs.slice(0, 10)],
      hovertext: [labels.slice(0, 10)],
      hoverinfo: 'hovertext',
      type: 'pie'
  };
  Plotly.restyle(PIE, pieUpdate);
}
function getData(sample, callback) {
  // Use a request to grab the json data needed for all charts
  Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
      if (error) return console.warn(error);
      Plotly.d3.json('/otu', function(error, otuData) {
          if (error) return console.warn(error);
          callback(sampleData, otuData);
      });
  });
  Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
      if (error) return console.warn(error);
      updateMetaData(metaData);
  })
  // BONUS - Build the Gauge Chart
  buildGauge(sample);
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
