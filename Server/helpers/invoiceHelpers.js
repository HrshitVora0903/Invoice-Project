function parseNumber(val) {
    return Number(parseFloat(val)) || 0;
}

function calculateTotalAmt(items) {
    return items.reduce((sum, item) => sum + parseNumber(item.amt), 0);
}

function calculateTotalGst(items) {
    return items.reduce((sum, item) => sum + parseNumber(item.gstAmt), 0);
}

function calculateNetAmt(items) {
    return items.reduce((sum, item) => sum + parseNumber(item.netAmt), 0);
}

const invoiceHelpers = {
    calculateTotalAmt,
    calculateTotalGst,
    calculateNetAmt,
    parseNumber,
};

export default invoiceHelpers;
