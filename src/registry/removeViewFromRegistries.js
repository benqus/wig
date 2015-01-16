function removeViewFromRegistries(view) {
    if (typeof view !== 'string') {
        view = view.getID();
    }

    ViewRegistry.unset(view);
}

wig.removeViewFromRegistries = removeViewFromRegistries;