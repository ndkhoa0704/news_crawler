function TimeUtil() {
    const self = {}
    return {
        /**
         * Converts a date string in DD/MM/YYYY or DD/MM/YYYY HH:mm:ss format to a Date object
         * @param {string} str - The date string to convert
         * @returns {Date} The parsed Date object in UTC
         * @example
         * // returns Date object for "2023-12-25T00:00:00.000Z"
         * strToDate("25/12/2023")
         * 
         * // returns Date object for "2023-12-25T14:30:45.000Z"
         * strToDate("25/12/2023 14:30:45")
         */
        strToDate: str => {
            const parts = str.split(' ');
            if (parts.length > 1) {
                const [d, m, y] = parts[0].split('/');
                const [h, min, s] = parts[1].split(':');
                return new Date(`${y}-${m}-${d}T${h}:${min}:${s}.000Z`);
            }
            const [d, m, y] = str.split('/');
            return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
        },
    }
}

export default TimeUtil();