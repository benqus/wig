var DOM = wig.DOM = Class.extend({

    getElement: function (root, selector) {
        root = this.selectNode(root);
        return root.querySelector(selector);
    },

    // find all nodes that contain a #Text node
    // starting with an "@" template tag (to insert a child view)
    findNodeWithTemplateTags: function (node) {
        var nodesByTag = {};

        // TODO:
        // find all #Text nodes with a template tag
        // register the nde for the template tag key

        return nodesByTag;
    },

    selectNode: function (element) {
        if (typeof element === 'string') {
            element = this.getElement(document.body, element);
        }

        return element;
    },

    initNode: function (element, classSet, dataSet) {
        var classes = classSet,
            i;

        if (Array.isArray(classSet)) {
            classes = classSet.join(' ');
        } else if (classSet && typeof classSet === 'object') {
            classes = [];
            for (i in classSet) {
                if (classSet.hasOwnProperty(i) && classSet[i]) {
                    classes.push(i);
                }
            }
            classes = classes.join(' ');
        }

        if (classes) {
            element.className = classes;
        }

        if (dataSet) {
            extend(element.dataset, dataSet);
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