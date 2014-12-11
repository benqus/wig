
function initNode(node, classes, dataMap) {
    var key;

    if (Array.isArray(classes)) {
        classes = classes.join(' ');
    } else if (typeof classes === 'object') {
        classes = Object.keys(classes).join(' ');

    }

    if (classes !== '') {
        node.className = classes;
    }

    if (dataMap) {
        extend(node.dataset, dataMap);
    }

    return node;
}
