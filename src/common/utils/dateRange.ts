export function getDateRange(year: number, month?: number) {
    if (month != undefined) {
        return {
            start: new Date(year, month - 1, 1),
            end: new Date(year, month, 1),
        };
    }

    return {
        start: new Date(year, 0, 1),
        end: new Date(year + 1, 0, 1),
    };
}
