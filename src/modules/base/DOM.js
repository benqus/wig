var DOM = module.DOM = Class.extend({

    initNode: function (element, classSet, attributes, dataSet) {
        var classes = classSet,
            cl;

        extend(element, attributes);
        extend(element.dataset, dataSet);

        if (Array.isArray(classSet)) {
            classes = classSet.join(' ');
        } else if (classSet && typeof classSet === 'object') {
            classes = [];
            for (cl in classSet) {
                if (classSet.hasOwnProperty(cl) && classSet[cl]) {
                    classes.push(cl);
                }
            }
            classes = classes.join(' ');
        }

        if (classes) {
            element.className = classes;
        }

        return element;
    },

    findClosestViewNode: function (element, attribute) {
        var attributeValue;

        do {
            attributeValue = element.getAttribute(attribute);

            if (attributeValue != null) {
                return attributeValue;
            }

            element = element.parentNode;
        } while (element !== document);
    },

    attachNodeToParent: function (childNode, parentNode, index) {
        if (typeof index === 'number') {
            parentNode.insertBefore(childNode, parentNode.children[index]);
        } else {
            parentNode.appendChild(childNode);
        }
    }

});