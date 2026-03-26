"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeriodDateRange = getPeriodDateRange;
exports.isWithinDateRange = isWithinDateRange;
exports.formatMonthLabel = formatMonthLabel;
exports.getTrailing12Months = getTrailing12Months;
function getPeriodDateRange(period, customFrom, customTo) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (period) {
        case 'this_month': {
            const from = new Date(today.getFullYear(), today.getMonth(), 1);
            const to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            return {
                from,
                to,
                label: from.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            };
        }
        case 'last_month': {
            const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
            return {
                from,
                to,
                label: from.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            };
        }
        case 'last_3_months': {
            const from = new Date(today.getFullYear(), today.getMonth() - 2, 1);
            const to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            return {
                from,
                to,
                label: 'Last 3 Months',
            };
        }
        case 'last_12_months': {
            const from = new Date(today.getFullYear(), today.getMonth() - 11, 1);
            const to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            return {
                from,
                to,
                label: 'Last 12 Months',
            };
        }
        case 'custom': {
            if (!customFrom || !customTo) {
                throw new Error('Custom period requires from and to dates');
            }
            const from = new Date(customFrom);
            const to = new Date(customTo + 'T23:59:59');
            return {
                from,
                to,
                label: `${customFrom} to ${customTo}`,
            };
        }
        default: {
            // Default to this month
            const from = new Date(today.getFullYear(), today.getMonth(), 1);
            const to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            return {
                from,
                to,
                label: from.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            };
        }
    }
}
function isWithinDateRange(dateStr, range) {
    const date = new Date(dateStr);
    return date >= range.from && date <= range.to;
}
function formatMonthLabel(year, month) {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}
function getTrailing12Months() {
    const result = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        result.push({
            year,
            month,
            key: `${year}-${String(month).padStart(2, '0')}`,
            label: formatMonthLabel(year, month),
        });
    }
    return result;
}
//# sourceMappingURL=dateUtils.js.map