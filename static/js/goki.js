function addTag(newValue, curParent, newClassName) {
	for ( var i = 0; i < curParent.children.length; i++) {
		if (curParent.children[i].value == newValue) {
			console.log(" rejected duplicate item - value " + newValue + " is already in the list");
			return;
		}
	}

	var newItem = document.createElement("input");
	newItem.type = "button";
	newItem.className = newClassName;
	newItem.name = "topic"
	newItem.onclick = function () { this.remove(); };
	newItem.value = newValue;
	newItem.size = newValue.length;

	curParent.appendChild(newItem);
	return
}

function addTopic() {
	addTag(document.getElementById("newTopic").value,
		document.getElementById("topicItems"),
		"btn btn-info");
}

function addAuthor(newValue) {
	addTag(document.getElementById("newAuthor").value,
		document.getElementById("authorItems"),
		"btn btn-success");
}

function createTagsOnLoad() {
	var urlParams = new URLSearchParams(window.location.search);

	for (oneTopic of urlParams.getAll("topic")) {
		addTag(oneTopic, document.getElementById("topicItems"), "btn btn-info");
	}

	for (oneTopic of urlParams.getAll("author")) {
		addTag(oneTopic, document.getElementById("authorItems"), "btn btn-success");
	}

}

function fixAlertBoxes() {
	console.log("Adjusting className on alert boxes"); //second console output

	var boxTypes = ['danger', 'warning', 'success', 'info'];
	var tagsToModify;

	for (var classType = 0; classType < boxTypes.length; classType++) {
		var oldTag = boxTypes[classType] + '-box';
		var newTag = 'alert alert-' + boxTypes[classType];
		elements = document.getElementsByClassName(oldTag);
		console.log("Found " + elements.length + " elements with class " + oldTag);
		for (var i = 0; i < elements.length; i++) {
			elements[i].className = elements[i].className + ' ' + newTag;
		}
	}
}

function pageRedirect(prefix, tag) {
	window.location.href=prefix + document.getElementById("dest").value
	return
}

function replaceCurrentTitleForTag(prefix, uriIndex) {
	var urlParts = window.location.pathname.split("/")
	if (urlParts.length < uriIndex) {
		return
	}
	var title = prefix + urlParts[uriIndex];
	locations = document.getElementsByName("titleLine")
	for (var each = 0; each < locations.length; each++) {
		locations[each].value = title
	}
}
