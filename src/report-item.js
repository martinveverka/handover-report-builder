export default class ReportItem {
    /** @type {string} */
    product;
    /** @type {string} */
    name;
    /** @type {number} */
    hours;
    /** @type {string} */
    type;

    /**
     * @param {string} name
     * @param {number} hours
     * @param {string} product
     * @param {string} type
     */
    constructor(product, name, hours, type) {
        this.product = product;
        this.name = name;
        this.hours = hours;
        this.type = type;
    }

    getRow() {
        return [
            this.product,
            this.name,
            this.hours,
            this.type,
        ];
    }
}
