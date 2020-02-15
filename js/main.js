var token = null;
var symbols = [];

function createChart(labels, series){
	new Chartist.Line('.ct-chart', {
		labels: labels,
		series: series
	}, {
		lineSmooth: Chartist.Interpolation.none(),
		showPoint: false,
		fullWidth: true,
		chartPadding: {
			right: 40
		}
	});
}
function makeChart(data){
	if (!data || !data.c)
		return;

	let labels = [];
	let series = [];
	// let cl = data.c.length;
	// for (let i = 0; i < cl; ++i) {
	// 	labels.push(i + 1);
	// }
	series.push(data.c);
	// Finally
	createChart(labels, series);
}
function onDetailsClick(){
	let index = this.id.charAt(10);
	let symbol = symbols[index];
	let resolution = "D";
	let count = 50;
	// Retrieve stock candle data
	let url = getStockCandleUrl(token, symbol, resolution, count);
	$.get(url, function(data, status){
		if (status === "success" && data.s === "ok"){
			makeChart(data);
		}
	});
}
function updateProgressBar(percentage){
	var element = document.getElementById("progressBar");
	element.style.width = percentage + "%";
}
function onGetJSON(data){
	token = data.token;
	symbols = data.symbols;
	var maxValues = data.values;
	var threshold = data.threshold;
	var count = symbols.length;

	if (maxValues.length != count){
		alert("Values number mismatch")
		return;
	}

	var values = [];
	var step = 0;
	var index = 0;
	function routine(){
		switch (step){
			case 0:
				// Values retrieval
				if (index < count){
					let url = getQuoteUrl(token, symbols[index]);
					$.get(url, function(data, status){
						if (status === "success"){
							values.push(data.pc);
							++index;
							updateProgressBar((index/count*100).toFixed(0));
							routine();
						} else {
							++index;
							routine();
						}
					});
				} else {
					if (values.length == count){
						index = 0;
						++step;
						routine();
					} else {
						alert("Something went wrong...");
					}
				}
			break;
			case 1:
				// HTML nodes creation
				for (let i = 0; i < count; ++i){
					// Create elements
					var rowNode = document.createElement("tr");
					var symbolCellNode = document.createElement("td");
					var valueCellNode = document.createElement("td");
					var minValueCellNode = document.createElement("td");
					var maxValueCellNode = document.createElement("td");
					var percentageCellNode = document.createElement("td");
					var detailsCellNode = document.createElement("td");
					var buttonNode = document.createElement("button");
					// Fill with data
					var maxValue = maxValues[i];
					var minValue = (threshold * maxValue).toFixed(2);
					var value = values[i];
					var percentage = (value / maxValue * 100).toFixed(2);
					symbolCellNode.innerText = symbols[i];
					valueCellNode.innerText = value;
					minValueCellNode.innerText = minValue;
					maxValueCellNode.innerText = maxValue;
					percentageCellNode.innerText = `${percentage}%`;
					buttonNode.innerText = "Details";
					buttonNode.onclick = onDetailsClick;
					buttonNode.setAttribute("id", `btnDetails${i}`);
					buttonNode.setAttribute("style", "width:100%");
					if (value >= maxValue)
						buttonNode.setAttribute("class", "w3-button w3-green");
					else if (value >= minValue)
						buttonNode.setAttribute("class", "w3-button w3-yellow");
					else
						buttonNode.setAttribute("class", "w3-button w3-red");
					// Build tree
					rowNode.appendChild(symbolCellNode);
					rowNode.appendChild(valueCellNode);
					rowNode.appendChild(minValueCellNode);
					rowNode.appendChild(maxValueCellNode);
					rowNode.appendChild(percentageCellNode);
					detailsCellNode.appendChild(buttonNode);
					rowNode.appendChild(detailsCellNode);
					document.getElementById("dataTable").appendChild(rowNode);
				}
			break;
		}
	}
	routine();
}
function onLoad(){
	$.getJSON("res/data.json", onGetJSON);
}

// Main routine
$(document).ready(function(){
	onLoad();
});