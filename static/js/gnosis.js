
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

function gnosisInit() {
    fixAlertBoxes();

}