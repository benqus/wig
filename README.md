Wig
===

- [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Status:

- Dev: [![Codeship Status for benqus/wig](https://codeship.com/projects/ab6a90f0-7fe0-0132-129a-66b1976afe6a/status?branch=dev)](https://codeship.com/projects/57380)
- Master: [![Codeship Status for benqus/wig](https://codeship.com/projects/ab6a90f0-7fe0-0132-129a-66b1976afe6a/status?branch=master)](https://codeship.com/projects/57380)

Minimalistic, scalable, extensible, dependency-less Front-end factory for HTML5 applications.

# Key concepts

 - disposability,
 - procedural (no-state) approach,
 - View isolation - Views know only about their own child Views
 - fault-tolerant DOM - because Views are disposed and rerendered if there are changes done to the DOM, Vies wil lrestore the latest state,
 - minimal cached templating

### What is a View?

Views are the bread and butter of the presentation.

The main roles for `wig.View`:

 - create and maintain a presentation structure,
 - interaction bridge between the DOM and the presentation logic,
 - template rendering with context.

Each View has its own root DOM Element representation in the actual DOM.

In Wig, there are no "hard links" or references to other Views. This means that Views only maintain an array of view IDs
to preserve the order of the child Views and to restrict access to child Views only.

Also, wig does not bind to DOM Elements directly, instead of that Views update the DOM.

To get a reference to a child View, simply pass in the **ID** or the **index** in order of the child View for the `wig.View#getView` method.

Example:

    var childView = parentView.getView(0); // get the first child view in order

### View:

 - `{View} : new View({object} [context])` - creates a new View.

 - `{Function}: View.extend({object} prototype, {object} static)` - creates a new class.

 - `{View}: View.add({object} [context], {View} parentView)` - creates a new View and adds it to a parent View.

### View context:

The following options are used by Wig on a context object:

 - `{string} [context.id]` - specifies an id (name) for a View,
 - `{string} [context.css]` - specifies additional CSS classes to be added to the root Node of the View,
 - `{string} [context.node]` - specifies a DOM Element to be wrapped around (controlled) by a View.

Example:

    var myView = new wig.View({
        id: 'myUniqueView',
        css: 'some class',
        node: document.createElement('p')
    });

    wig.renderView(myView, document.body);

### View API:

 - `View#render()` - implement this method to add child Views and create the presentation structure.

 - `View#update({object} [newContext])` - to update the current presenation structure with optional context updates.

 - `View#remove()` - to remove and destroy a View or the current presentation structure.

### Life-cycle methods of a View:

 - `View#onAttach()` (user override) - executed when the View has already been attached to the DOM and is visible.
 Override this method to introduce animations or widgets from other libraries (ex: a datepicker).

 - `View#onDetach()` (user override) - executed before the View is removed from the DOM and is still visible.
 Override this method to remove any custom behavior introduced in `View#onAttach`.

 - `{object}: View#parseContext({object} newContext)` - before a View is updated

### Templating:

Wig comes with a built-in, minimal templating engine to access the View context attributes.

### Customization:

You can introduce a custom templating engine (such as Mustache or Handlebars), if you like,
by overriding the `wig.env.compile` method.

Example with Handlebars:

    wig.env.compile = function (template, context) {
        return Handlebars.compile(template, context);
    };

### Older browser support:

You are able to make wig backwards compatible with older browsers that don't support certain features.

Bypass `document.activeElement` to preserve the focused element by overriding the `wig.env.getElement` method.

Example:

    wig.env.getFocusedElement = function () {
        // return the focused element with your logic
    };

Bypass `Element.querySelector` to query for a DOM element with a CSS selector by overriding the `wig.env.getElement` method.

Example with jQuery:

    // for browsers < IE8
    wig.env.getElement = function (parentNode, selector) {
        return jQuery(selector, parentNode)[0];
    };
