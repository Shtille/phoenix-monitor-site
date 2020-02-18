const ButtonColors = {
	FAIL : "w3-amber",
	ABOVE : "w3-green",
	INSIDE : "w3-yellow",
	BELOW : "w3-red"
};
var globalData = null;

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
function updateButtonColor(buttonNode, value, minValue, maxValue){
	if (value >= maxValue)
		buttonNode.classList.add(ButtonColors.ABOVE);
	else if (value >= minValue)
		buttonNode.classList.add(ButtonColors.INSIDE);
	else
		buttonNode.classList.add(ButtonColors.BELOW);
}
function onDetailsClick(){
	var failed = this.classList.contains("failed");
	var index = this.id.charAt(10);
	var token = globalData.token;
	var symbol = globalData.symbols[index];
	if (failed){
		// Retry to obtain the data
		let url = getQuoteUrl(token, symbol);
		$.get(url, function(data, status){
			if (status === "success"){
				let dataValue = data.pc;
				globalData.values[index] = dataValue;
				let nodes = findRowNodes(index);
				updateRowData(nodes, index);
			}
		});
	} else {
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
}
function updateProgressBar(percentage){
	var element = document.getElementById("progressBar");
	element.style.width = percentage + "%";
}
function getMinValue(threshold, maxValue){
	return (threshold * maxValue).toFixed(2);
}
function getPercentage(value, maxValue){
	return (value / maxValue * 100).toFixed(2);
}
function createRowNodes(){
	// Create elements
	var rowNode = document.createElement("tr");
	var symbolCellNode = document.createElement("td");
	var valueCellNode = document.createElement("td");
	var minValueCellNode = document.createElement("td");
	var maxValueCellNode = document.createElement("td");
	var percentageCellNode = document.createElement("td");
	var detailsCellNode = document.createElement("td");
	var buttonNode = document.createElement("button");
	return {
		rowNode : rowNode,
		symbolCellNode : symbolCellNode,
		valueCellNode : valueCellNode,
		minValueCellNode : minValueCellNode,
		maxValueCellNode : maxValueCellNode,
		percentageCellNode : percentageCellNode,
		detailsCellNode : detailsCellNode,
		buttonNode : buttonNode
	};
}
function findRowNodes(index){
	var tableNode = document.getElementById("dataTable");
	var rowlist = tableNode.getElementsByClassName("tableRow");
	if (rowlist.length <= index){
		alert("WTF");
		return null;
	}
	var rowNode = rowlist[index];
	var symbolCellNode = rowNode.childNodes[0];
	var valueCellNode = rowNode.childNodes[1];
	var minValueCellNode = rowNode.childNodes[2];
	var maxValueCellNode = rowNode.childNodes[3];
	var percentageCellNode = rowNode.childNodes[4];
	var detailsCellNode = rowNode.childNodes[5];
	var buttonNode = detailsCellNode.childNodes[0];
	return {
		rowNode : rowNode,
		symbolCellNode : symbolCellNode,
		valueCellNode : valueCellNode,
		minValueCellNode : minValueCellNode,
		maxValueCellNode : maxValueCellNode,
		percentageCellNode : percentageCellNode,
		detailsCellNode : detailsCellNode,
		buttonNode : buttonNode
	};
}
function buildRowNodes(nodes){
	// Build tree
	nodes.rowNode.appendChild(nodes.symbolCellNode);
	nodes.rowNode.appendChild(nodes.valueCellNode);
	nodes.rowNode.appendChild(nodes.minValueCellNode);
	nodes.rowNode.appendChild(nodes.maxValueCellNode);
	nodes.rowNode.appendChild(nodes.percentageCellNode);
	nodes.detailsCellNode.appendChild(nodes.buttonNode);
	nodes.rowNode.appendChild(nodes.detailsCellNode);
	document.getElementById("dataTable").appendChild(nodes.rowNode);
}
function fillRowData(nodes, index){
	var maxValue = globalData.maxValues[index];
	var minValue = globalData.minValues[index];
	var value = globalData.values[index];
	var percentage = getPercentage(value, maxValue);

	nodes.rowNode.setAttribute("id", `row${index}`);
	nodes.rowNode.setAttribute("class", "tableRow");
	nodes.symbolCellNode.innerText = globalData.symbols[index];
	nodes.valueCellNode.innerText = value;
	nodes.minValueCellNode.innerText = minValue;
	nodes.maxValueCellNode.innerText = maxValue;
	nodes.percentageCellNode.innerText = `${percentage}%`;
	nodes.buttonNode.onclick = onDetailsClick;
	nodes.buttonNode.setAttribute("id", `btnDetails${index}`);
	nodes.buttonNode.setAttribute("style", "width:100%");
	nodes.buttonNode.classList.add("w3-button");
	if (value == 0){ // Data retrieval has failed
		nodes.buttonNode.innerText = "Retry";
		nodes.buttonNode.classList.add(ButtonColors.FAIL);
		nodes.buttonNode.classList.add("failed");
	} else {
		nodes.buttonNode.innerText = "Details";
		updateButtonColor(nodes.buttonNode, value, minValue, maxValue);
	}
}
function updateRowData(nodes, index){
	if (!nodes)
		return;
	var maxValue = globalData.maxValues[index];
	var minValue = globalData.minValues[index];
	var value = globalData.values[index];
	var percentage = getPercentage(value, maxValue);

	nodes.valueCellNode.innerText = value;
	nodes.minValueCellNode.innerText = minValue;
	nodes.maxValueCellNode.innerText = maxValue;
	nodes.percentageCellNode.innerText = `${percentage}%`;
	if (value == 0){
		// Data retrieval has failed
		nodes.buttonNode.innerText = "Retry";
		nodes.buttonNode.classList.remove(ButtonColors.ABOVE);
		nodes.buttonNode.classList.remove(ButtonColors.INSIDE);
		nodes.buttonNode.classList.remove(ButtonColors.BELOW);
		nodes.buttonNode.classList.add(ButtonColors.FAIL);
		nodes.buttonNode.classList.add("failed");
	} else {
		nodes.buttonNode.innerText = "Details";
		nodes.buttonNode.classList.remove(ButtonColors.FAIL);
		nodes.buttonNode.classList.remove("failed");
		updateButtonColor(nodes.buttonNode, value, minValue, maxValue);
	}
}
function createTableRow(index){
	var nodes = createRowNodes();
	fillRowData(nodes, index);
	buildRowNodes(nodes);
}
function setGlobalData(data){
	globalData = {};
	globalData.token = data.token;
	globalData.symbols = data.symbols;
	globalData.threshold = data.threshold;
	globalData.values = [];
	globalData.maxValues = [];
	globalData.minValues = [];
	for (let i = 0; i < data.symbols.length; ++i){
		let maxValue = data.values[i];
		let minValue = getMinValue(data.threshold, maxValue);
		globalData.values.push(0);
		globalData.maxValues.push(maxValue);
		globalData.minValues.push(minValue);
	}
}
function onGetJSON(data){
	setGlobalData(data);
	var count = globalData.symbols.length;

	if (data.values.length != count){
		alert("Values number mismatch")
		return;
	}

	var step = 0;
	var index = 0;
	function routine(){
		switch (step){
			case 0:
				// Values retrieval
				if (index < count){
					let url = getQuoteUrl(globalData.token, globalData.symbols[index]);
					$.get(url, function(data, status){
						let dataValue = (status === "success") ? data.pc : 0;
						globalData.values[index] = dataValue;
						++index;
						updateProgressBar((index/count*100).toFixed(0));
						routine();
					});
				} else {
					index = 0;
					++step;
					routine();
				}
			break;
			case 1:
				// HTML nodes creation
				for (let i = 0; i < count; ++i){
					createTableRow(i);
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