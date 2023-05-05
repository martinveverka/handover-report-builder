export default class Provider {
    /**
     * @param {string} name
     * @param {string} companyNo
     * @param {boolean} vatPayer
     * @param {object} signature
     * @param {?string} signature.path
     * @param {?string} signature.offset_y
     */
    constructor(name, companyNo, vatPayer, signature) {
        this.name = name;
        this.companyNo = companyNo;
        this.vatPayer = vatPayer;
        this.signature = signature;
    }
}
