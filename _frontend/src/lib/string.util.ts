export namespace StringUtility {
    export function toSnakeCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')  // Insert underscore between camelCase boundaries
            .replace(/\s+/g, '')                  // Replace spaces with underscores
            .replace(/_+/g, '-')                   // Replace hyphens with underscores
            .toLowerCase();                        // Convert to lowercase
    }

    export function toPascalCase(str: string) {
        return str
            .replace(/([-_ ]+)./g, (_, charAfterSeparator) => charAfterSeparator.toUpperCase()) // Remove separators and capitalize the following character
            .replace(/./, char => char.toUpperCase()) // Capitalize the first character
            .replace(/[-_ ]+/g, ''); // Remove any remaining separators
    }


    export function trimString(str: string, maxLen: number) {
        if (str.length > maxLen) {
            return str.substring(0, maxLen - 3) + '...';
        }
        return str;
    }
}