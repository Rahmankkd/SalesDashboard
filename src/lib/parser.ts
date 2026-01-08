export function parseWhatsAppReport(text: string) {
    const lower = text.toLowerCase();
    const lines = lower.split('\n');

    const data = {
        reportDate: null as string | null, // NEW FIELD
        sales: 0,
        target: 0,
        variance: 0,
        tc: 0,
        sales_mtd: 0,
        beverages: 0,
        food_panda: 0,
        grab_food: 0,
        shopee_food: 0
    };

    lines.forEach(line => {
        // 0. CAPTURE DATE (Format: "Date: 5/1/2026")
        if (line.includes('date:')) {
            const dateStr = line.split('date:')[1].trim();
            // Simple date parser (assumes DD/MM/YYYY)
            const parts = dateStr.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
            if (parts) {
                // Convert to YYYY-MM-DD for Database
                data.reportDate = `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            }
        }

        // 1. Daily Sales
        else if ((line.includes('total net sales') || line.includes('daily net sales')) && !line.includes('mtd')) {
            data.sales = extractMoney(line);
        }
        // 2. Target
        else if (line.includes('target') && !line.includes('mtd')) {
            data.target = extractMoney(line);
        }
        // 3. Sales MTD
        else if (line.includes('sales mtd')) {
            data.sales_mtd = extractMoney(line);
        }
        // 4. Variance
        else if (line.includes('var') || line.includes('variance')) {
            data.variance = extractMoney(line);
            if (line.includes('-') || line.includes('neg')) data.variance = -Math.abs(data.variance);
        }
        // 5. TC
        else if (line.includes('tc:') || line.includes('tc ')) {
            data.tc = extractNumber(line);
        }
        // 6. Beverages
        else if (line.includes('beverages')) {
            data.beverages = extractMoney(line);
        }
        // 7. Delivery
        else if (line.includes('food panda') || line.includes('foodpanda')) {
            data.food_panda = extractMoneyFromSlash(line);
        }
        else if (line.includes('grabfood') || line.includes('grab')) {
            data.grab_food = extractMoneyFromSlash(line);
        }
        else if (line.includes('shopeefood') || line.includes('shopee')) {
            data.shopee_food = extractMoneyFromSlash(line);
        }
    });

    return data;
}

function extractNumber(text: string): number {
    const clean = text.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
}

function extractMoney(text: string): number {
    const clean = text.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
}

function extractMoneyFromSlash(text: string): number {
    if (text.includes('/')) {
        const parts = text.split('/');
        if (parts[1].toLowerCase().includes('rm') || parts[1].match(/[0-9]/)) {
            return extractMoney(parts[1]);
        }
    }
    return extractMoney(text);
}