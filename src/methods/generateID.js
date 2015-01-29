/**
 * Generates a new unique string based on the
 * provided prefix and the latest Id.
 * @param   {string} prefix
 * @returns {string}
 */
function generateID(prefix) {
    return ((prefix || 0) + Id++);
}

wig.generateID = generateID;