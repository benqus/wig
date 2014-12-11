
function attachNodeToParent(childNode, parentNode, index) {
    if (typeof index === 'number') {
        parentNode.insertBefore(childNode, parentNode.children[index]);
    } else {
        parentNode.appendChild(childNode);
    }
}
