
export default function isNativeType(value) {
    var type = typeof value;
    return type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined' ||
        value === null;
}


