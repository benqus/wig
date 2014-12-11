/**
 * @class View
 * @param    {object}  options
 * @property {object} [attributes]
 * @property {Node}   [node]
 * @property {string} [id] - user defined or internal identifier
 * @property {string} [parentID] - internal
 * @constructor
 */
function View(options) {
    options = (options || {});

    this._ID = (options.id || generateID('v'));
    this._PID = options.parentID; // soft link to parent

    this.node = options.node;
    this.children = [];
    this.attributes = extend({}, options.attributes);

    this.initialize();

    ViewRegistry[this.getID()] = this;
}