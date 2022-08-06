
export const validatePropertiesOnObject = (obj, properties) => {

    if (typeof obj !== "object") {
        return false;
    }

    const valid = properties.every(element =>
        obj.hasOwnProperty(element)
    );

    return valid;
}