/**
 * Gets a value from an object using a dot-separated path
 * 
 * @param obj - The object to traverse
 * @param path - Dot-separated path to the value
 * @returns The value at the path or undefined if not found
 */
export function getValueByPath(obj: unknown, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
        if (current == null || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }
    return current;
}

/**
 * Sets a value in an object using a dot-separated path
 * 
 * @param obj - The object to modify
 * @param path - Dot-separated path to the value
 * @param value - The value to set
 */
export function setValueByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!key) continue;
        if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
        current[lastKey] = value;
    }
}
