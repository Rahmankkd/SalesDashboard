# Parser Bug Analysis

## The Problem

**Input:** `Beverages (RM) RM 93.76/RM200`  
**Expected Output:** `93.76`  
**Actual Output:** `1341.662` ❌

## Root Cause

The parser is **DOUBLE COUNTING** beverages because:

### 1. Line 54 - Captures the main beverages value
```typescript
else if (line.includes('beverages')) {
    data.beverages += extractMoney(line);  // Extracts RM 93.76 ✅
}
```

### 2. Lines 82-86 - ALSO adds combo items to beverages
```typescript
if (lowerLine.includes('combo') || ... ) {
    const val = extractMoneyFromSlash(line);
    if (val > 0) {
        data.beverages += val;  // ❌ This adds ALL combo/promo prices!
    }
}
```

## What's Being Added Incorrectly

From your WhatsApp data, these lines are ALL being added to beverages:

| Item | Amount Added |
|------|--------------|
| `Beverages (RM) RM 93.76/RM200` | ✅ RM 93.76 (correct) |
| `Half Dozen: 16/RM403.18` | ❌ RM 403.18 |
| `Box of 3: 52/RM 676.6` | ❌ RM 676.6 |
| `Single:155 /RM 370.3` | ❌ RM 370.3 (contains "doughnut" keyword) |
| `Taro : 24/-/24` | May match some keywords |
| `Thai Green Tea :18/-/18` | May match |
| `Thai Milk Tea : 36/-/36` | May match |
| `Coconut Shake : 24/-/24` | May match |
| Plus ALL combo items... | ❌ Adding everything |

**The keyword matching on line 80 (`lowerLine.includes('doughnut')`) is catching product lines that shouldn't be added to beverages!**

## The Fix

The parser should **NOT** add combo/product items to the beverages total. Only the explicit "Beverages (RM)" line should be counted.

### Solution:
Remove lines 82-86 that add combo items to beverages. Combo items should only be tracked in `combo_details`, not added to the beverages total.
