export function parseWhatsAppReport(text: string) {
    const lower = text.toLowerCase();
    const lines = lower.split('\n');

    const data = {
        reportDate: null as string | null,
        sales: 0,              // Total Net Sales
        daily_net_sales: 0,    // Daily Net Sales
        event_sales: 0,        // Event Net Sales
        bulk_sales: 0,         // Bulk Net Sales
        target: 0,
        variance: 0,
        tc: 0,
        sales_mtd: 0,
        beverages: 0,
        food_panda: 0,
        grab_food: 0,
        shopee_food: 0,
        combo_details: {} as Record<string, number>
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


        // 1. Sales Fields (prioritize specific over generic)
        // Daily Net Sales
        else if (line.includes('daily net sales')) {
            data.daily_net_sales = extractMoney(line);
        }
        // Event Net Sales
        else if (line.includes('event net sales') || (line.includes('event') && line.includes('sales'))) {
            data.event_sales = extractMoney(line);
        }
        // Bulk Net Sales
        else if (line.includes('bulk net sales') || line.includes('bulk sales')) {
            data.bulk_sales = extractMoney(line);
        }
        // Total Net Sales (fallback - must come after specific checks)
        else if ((line.includes('total net sales') || line.includes('net sales')) && !line.includes('mtd')) {
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
        // 6. Beverages (Standard format: "Beverages (RM) RM 93.76/RM200")
        else if (line.includes('beverages')) {
            data.beverages += extractMoneyBeforeSlash(line);
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

        // 8. COMBO & PROMO ITEMS
        else {
            const lowerLine = line.toLowerCase();
            if (
                lowerLine.includes('combo') ||
                lowerLine.includes('tincase') ||
                lowerLine.includes('ala carte') ||
                lowerLine.includes('blind box') ||
                lowerLine.includes('pac-dots') ||
                lowerLine.includes('holiday treats') ||
                lowerLine.includes('supremo') ||
                lowerLine.includes('coffee deal') ||
                lowerLine.includes('chiller')
                // REMOVED 'doughnut' keyword to prevent matching product lines like "Half Dozen", "Box of 3", etc.
            ) {
                // EXTRACT QUANTITY (PCS) -> combo_details
                // Logic: Look for number before '/' or after colon
                let pcs = 0;
                if (line.includes('/')) {
                    const parts = line.split('/');
                    const preSlash = parts[0];
                    const match = preSlash.match(/[:\s](\d+)$/) || preSlash.match(/^(\d+)$/); // e.g. "Item: 1" or "1"
                    if (match) pcs = parseInt(match[1]);
                    else {
                        const colMatch = preSlash.match(/:(\d+)$/);
                        if (colMatch) pcs = parseInt(colMatch[1]);
                    }
                } else if (line.includes(':')) {
                    const parts = line.split(':');
                    const val = parseInt(parts[1].trim());
                    if (!isNaN(val)) pcs = val;
                }

                if (pcs > 0) {
                    // Detailed JSON
                    let key = line.split('/')[0].split(':')[0].trim();
                    // Clean up key
                    key = key.replace(/^\*+|\*+$/g, '').trim();
                    data.combo_details[key] = (data.combo_details[key] || 0) + pcs;
                }
            }
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

function extractMoneyBeforeSlash(text: string): number {
    if (text.includes('/')) {
        const parts = text.split('/');
        // Extract from the first part (before slash): "Beverages (RM) RM 93.76" from "Beverages (RM) RM 93.76/RM200"
        return extractMoney(parts[0]);
    }
    return extractMoney(text);
}