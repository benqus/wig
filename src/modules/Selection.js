var Selection = wig.Selection = {

    id:   undefined,
    path: undefined,

    start: 0,
    end:   0,

    preserveSelection: function () {
        var node  = this.getSelectedNode();

        this.start = node.selectionStart;
        this.end   = node.selectionEnd;
    },

    getIndexOfNode: function (node, viewNode) {
        var path = [];

        do {
            path.push(node.classList[0] ||
                arrayIndexOf.call(node.parentNode.children, node));
            node = node.parentNode;
        } while (node !== viewNode);

        return path;
    },

    preserveSelectionInView: function (updatingView) {
        var node = document.activeElement,
            focusedViewID = DOM.findClosestViewNode(node, VIEW_DATA_ATTRIBUTE),
            updatingViewID = updatingView.getID(),
            viewNode;

        if (focusedViewID && focusedViewID === updatingViewID) {
            this.preserveSelection();

            viewNode = updatingView.getNode();

            this.id = updatingViewID;
            if (node !== viewNode) {
                this.path = (node.id || this.getIndexOfNode(node, viewNode));
            }
        }
    },

    restoreSelection: function (node) {
        if (typeof node.setSelectionRange !== 'function') {
            return;
        }

        node.setSelectionRange(this.start, this.end);
    },

    findNodeByIndex: function (index, node) {
        if (typeof index === 'number') {
            node = node.children[index];
        } else {
            node = node.children[0];
            if (node.classList[0] !== index) {
                do {
                    node = node.nextSibling;
                } while (node.classList[0] !== index);
            }
        }

        return node;
    },

    restoreSelectionInView: function (view) {
        // place focus in the node
        var node = view.getNode(),
            path = this.path,
            index;

        if (this.id && this.id === view.getID()) {
            if (path.length > 0) {
                do {
                    // dig down to find focused node
                    index = path.pop();
                    node = this.findNodeByIndex(index, node);
                } while (path.length !== 0);
            }

            // restore selection if node is an editable element
            this.restoreSelection(node);

            node.focus();

            this.id = undefined;
            this.path = undefined;
        }
    },

    getSelectedNode: function () {
        return document.activeElement;
    }
};