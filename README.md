Wig
===

- [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Status:

- Dev: [![Codeship Status for benqus/wig](https://codeship.com/projects/ab6a90f0-7fe0-0132-129a-66b1976afe6a/status?branch=dev)](https://codeship.com/projects/57380)
- Master: [![Codeship Status for benqus/wig](https://codeship.com/projects/ab6a90f0-7fe0-0132-129a-66b1976afe6a/status?branch=master)](https://codeship.com/projects/57380)

Minimalistic, scalable, extensible, dependency-less Front-end factory for HTML5 applications.

Don't forget to check out the [examples](https://github.com/benqus/wig/tree/master/examples)!

Key concepts are:

 - Disposability,
 - procedural (no-state) approach,
 - View isolation - Views know only about their own child Views
 - fault-tolerant DOM - because Views are disposed and rerendered if there are changes done to the DOM, Vies will restore the latest state,
 - minimal templating engine with caching

## What is a View?

Views are the bread and butter of the presentation.

The main roles for `wig.View`:

 - create and maintain a presentation structure,
 - interaction bridge between the DOM and the presentation logic,
 - template rendering with context.

Each View has its own root DOM Element representation in the actual DOM.

In Wig, there are no "hard links" or references to other Views. This means that Views only maintain an array of view IDs
to preserve the order of the child Views and to restrict access to child Views only.

Also, wig does not bind to DOM Elements directly, instead of that Views update the DOM.

## View:

 - `{View}: new View({object} [context])` - creates a new View.
 - `{Function}: View.extend({object} prototype, {object} static)` - creates a new class.
 - `{View}: View.add({object} [context], {View} parentView)` - creates a new View and adds it to a parent View.

## View context:

When you create a View you create it with rendering context properties. These properties will be used to render the View's template.

However, there are 3 predefined properties used by Wig outside of the rendering context:

 - `{string} [context.id]` - specifies an id (name) for a View,
 - `{string} [context.css]` - specifies additional CSS classes to be added to the root Node of the View,
 - `{string} [context.node]` - specifies a DOM Element to be wrapped around (controlled) by a View.

These proeprties will not be accessible in the rendering context.

Example:

    var myView = new wig.View({
        id: 'myUniqueView',
        css: 'some class',
        node: document.createElement('p')
    });

    wig.renderView(myView, document.body);

You can also specify custom expectations (expects) for certain properties to be put on the View instead of the rendering context.

#### View context API:

 - `{*}: View#get({string} contextAttribute)` - get an attribute from the rendering context
 - `void: View#set({object} contextAttributes)` - set attributes on the rendering context

#### Expect a property from the creator

You can specify certain properties your View expects to use outside of the rendering context.

 - `{string[]} View#expects`

Example:

    var TestView = wig.View.extend({
        expects: [ 'onClick' ],
    });

Expected methods can be easily bound to DOM events also.

Example:

    var TestView = wig.View.extend({
        expects: [ 'onClick' ],

        events: {
            click: 'onClick'
        }
    });

## View API:

 - `void: View#update({object} [newContext])` - to update the View with optional context updates.
 - `void: View#remove()` - to remove and destroy a View or the current presentation structure.
 - `{Element}: View#getView({string} childIDorIndex)` - get a direct child View in the container View by its unique ID or by its index in order
 - `{Element}: View#find({string} selector)` - find DOM Elements by a CSS selector in the Views root Element
 - `void: View#setNode({Element} element)` - set a new Element to be the root Element of a View and re-initialize the View

## View API overrides for dynamic presentation building:

 - `void: View#render()` - implement this method to add child Views and create the presentation structure.
 - `{object}: View#parseContext({object} newContext)` - parse the context before the View is updated
 - `{string}: View#getCSS()` - generate additional CSS classes for the root Element of the View
 - `{object}: View#getAttributes()` - generate attributes for the root Element of the View (ex: disable button by returning `{ disabled: 'disabled' }`

## Life-cycle methods of a View:

 - `void: View#onAttach()` (user override) - executed when the View has already been attached to the DOM and is visible.
 Override this method to introduce animations or widgets from other libraries (ex: a datepicker).
 - `void: View#onDetach()` (user override) - executed before the View is removed from the DOM and is still visible.
 Override this method to remove any custom behavior introduced in `View#onAttach`.

## DOM Events:

Wig.uses one and only one bound function to proxy all bubbling DOM Events and notify the closest View which listens to the actual event type.

You can also delegate this event listener to an Element in case of a non-bubbling DOM Event.

Example:

    var MyClass = wig.View.extend({
        ...
        events: {
            click: function (event) {
                alert("Hello!");
            },
            keypress: 'onKeyPress'
        },

        onKeyPress: function ...,

        ...
    });

#### Delegating non-bubbling event listeners:

 - `void: View#delegate({string} eventType, {Element} element)` - to start listening for non-bubbling DOM Events

The delegated event listener will be automatically unbound when the View is destroyed or updated.

Example:

    var MyClass = wig.View.extend({
        tagName: 'video',
        ...
        events: {
            progress: function (event) ...
        },
        ...
        onAttach: {
            this.delegate('progress');
        }
        ...
    });


## Templating:

Wig comes with a built-in minimal, logic-less templating engine to access the View context attributes.

Example:

    var MyClass = View.extend({
        tagName: 'h1',
        template: '{{ title }}',
        ...
    });

## Adding child Views:

Building up a presentation structure is done via the `View#render` method. This render method is called each time a View is created or updated.

You can specify an CSS selector for a child View to be rendered into by creating a

    View#renderMap: {
        '[childID]' : '[selector]'
    }

> **Tip:** use `'*'` as `childID` to render all your dynamically generated children with the same selector

Example:

    var View = wig.View;

    var MyClass = View.extend({
        ...
        template: [
            '<div class="controls"></div>',
            '<div class="content">{{ content }}</div>'
        ],
        renderMap: {
            'off-button': '.controls'
        },
        render: function () {
            View.add(
                {
                    id: 'off-button',
                    css: 'fa fa-icon-off'
                },
                this
            );
        },
        ...
    });

## Customization:

You can introduce a custom templating engine (such as Mustache or Handlebars), if you like,
by overriding the `wig.api.compile` method.

Example with Handlebars:

    wig.setup({
        ... ,
        compile: function (template, context) {
            return Handlebars.compile(template, context);
        }
    });

## Older browser support:

You are able to make wig backwards compatible with older browsers that don't support certain features.

Bypass `document.activeElement` to preserve the focused element by overriding the `wig.api.getFocusedElement` method.

Example:

    wig.setup({
        ... ,
        getFocusedElement: function () {
            // return the focused element with your logic
        }
    });

Bypass `Element.querySelector` to query for a DOM element with a CSS selector by overriding the `wig.api.getElement` method.

Example with jQuery:

    // for browsers < IE8
    wig.setup({
        ... ,
        getElement: function (parentNode, selector) {
            return jQuery(selector, parentNode)[0];
        }
    });
