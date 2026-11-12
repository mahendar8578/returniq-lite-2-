// ReturnIQ Lite - Demo Seed Data
// Run: cd server && npm run seed

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const { Return } = require('./models/Return');
const Settings = require('./models/Settings');

// ----- Demo Products (8-10 items, realistic SKUs) -----
const PRODUCTS = [
  {
    productName: 'Wireless Bluetooth Headphones',
    productCode: 'EL-BTH-001',
    category: 'Electronics',
    supplier: 'SoundWave Supplies',
    totalSold: 240,
    totalReturned: 0   // will be incremented by return seed
  },
  {
    productName: 'USB-C Fast Charging Cable',
    productCode: 'EL-USBC-002',
    category: 'Electronics',
    supplier: 'TechLink Wholesale',
    totalSold: 580,
    totalReturned: 0
  },
  {
    productName: 'Men\'s Running Sneakers',
    productCode: 'CL-MRS-003',
    category: 'Clothing',
    supplier: 'StepRight Footwear',
    totalSold: 190,
    totalReturned: 0
  },
  {
    productName: 'Women\'s Floral Kurta Set',
    productCode: 'CL-WFK-004',
    category: 'Clothing',
    supplier: 'FashionHub Traders',
    totalSold: 310,
    totalReturned: 0
  },
  {
    productName: 'Stainless Steel Water Bottle',
    productCode: 'HM-SSW-005',
    category: 'Home',
    supplier: 'EcoHaven Products',
    totalSold: 420,
    totalReturned: 0
  },
  {
    productName: 'Non-Stick Cookware Set',
    productCode: 'KT-NSC-006',
    category: 'Kitchen',
    supplier: 'CookPro Distributors',
    totalSold: 145,
    totalReturned: 0
  },
  {
    productName: 'Leather Laptop Backpack',
    productCode: 'AC-LLB-007',
    category: 'Accessories',
    supplier: 'UrbanCarry Co.',
    totalSold: 215,
    totalReturned: 0
  },
  {
    productName: 'Portable Bluetooth Speaker',
    productCode: 'EL-PBS-008',
    category: 'Electronics',
    supplier: 'SoundWave Supplies',
    totalSold: 165,
    totalReturned: 0
  },
  {
    productName: 'Cotton Bath Towel Set',
    productCode: 'HM-CBT-009',
    category: 'Home',
    supplier: 'ComfortLinen Mills',
    totalSold: 530,
    totalReturned: 0
  }
];

// ----- Return log entries (25-30 realistic records) -----
// Quantities are designed so some products cross the 10% threshold

const RETURN_LOGS = [
  // Wireless Bluetooth Headphones (EL-BTH-001) - 240 sold, 50 returns = 20.8% -> ALERT
  { code: 'EL-BTH-001', reason: 'Damaged', quantity: 12, notes: 'Ear cushion cracked during first use. Multiple customers reported same batch.', returnDate: '2026-10-02' },
  { code: 'EL-BTH-001', reason: 'Quality Issue', quantity: 15, notes: 'Audio crackling after one week of use. Supplier quality concern.', returnDate: '2026-10-14' },
  { code: 'EL-BTH-001', reason: 'Wrong Product', quantity: 8, notes: 'Color mismatch — white variant delivered instead of black.', returnDate: '2026-10-28' },
  { code: 'EL-BTH-001', reason: 'Customer Changed Mind', quantity: 5, notes: 'Customer bought a different brand after researching.', returnDate: '2026-11-05' },
  { code: 'EL-BTH-001', reason: 'Late Delivery', quantity: 10, notes: 'Festival delivery missed. Customer declined delivery.', returnDate: '2026-11-08' },

  // USB-C Fast Charging Cable (EL-USBC-002) - 580 sold, 35 returns = 6.03% -> HEALTHY
  { code: 'EL-USBC-002', reason: 'Damaged', quantity: 18, notes: 'Cable insulation splitting near the connector.', returnDate: '2026-10-05' },
  { code: 'EL-USBC-002', reason: 'Wrong Product', quantity: 7, notes: 'Sent 1-meter cable; customers ordered 2-meter variant.', returnDate: '2026-10-20' },
  { code: 'EL-USBC-002', reason: 'Quality Issue', quantity: 10, notes: 'Slow charging speed below advertised spec.', returnDate: '2026-11-01' },

  // Men's Running Sneakers (CL-MRS-003) - 190 sold, 42 returns = 22.1% -> ALERT
  { code: 'CL-MRS-003', reason: 'Size/Fit', quantity: 22, notes: 'Sizing runs small compared to standard chart. Multiple exchanges requested.', returnDate: '2026-10-08' },
  { code: 'CL-MRS-003', reason: 'Quality Issue', quantity: 12, notes: 'Sole separated from upper after 2-3 weeks of use.', returnDate: '2026-10-22' },
  { code: 'CL-MRS-003', reason: 'Damaged', quantity: 8, notes: 'Received with scuff marks and dirt — packaging damaged in transit.', returnDate: '2026-11-03' },

  // Women's Floral Kurta Set (CL-WFK-004) - 310 sold, 28 returns = 9.03% -> HEALTHY (just under threshold)
  { code: 'CL-WFK-004', reason: 'Size/Fit', quantity: 14, notes: 'Colour appeared different on-screen vs actual product.', returnDate: '2026-10-10' },
  { code: 'CL-WFK-004', reason: 'Customer Changed Mind', quantity: 9, notes: 'Did not match the customer\'s other clothing.', returnDate: '2026-10-30' },
  { code: 'CL-WFK-004', reason: 'Damaged', quantity: 5, notes: 'Stitching loose near the neckline on multiple sets.', returnDate: '2026-11-06' },

  // Stainless Steel Water Bottle (HM-SSW-005) - 420 sold, 18 returns = 4.28% -> HEALTHY
  { code: 'HM-SSW-005', reason: 'Damaged', quantity: 10, notes: 'Lid leaking — O-ring sealing defect in a batch.', returnDate: '2026-10-12' },
  { code: 'HM-SSW-005', reason: 'Wrong Product', quantity: 8, notes: '750ml delivered when 1L was ordered.', returnDate: '2026-11-02' },

  // Non-Stick Cookware Set (KT-NSC-006) - 145 sold, 32 returns = 22.06% -> ALERT
  { code: 'KT-NSC-006', reason: 'Quality Issue', quantity: 20, notes: 'Non-stick coating peeling off after 3-4 uses. Health concern raised by multiple customers.', returnDate: '2026-10-18' },
  { code: 'KT-NSC-006', reason: 'Damaged', quantity: 7, notes: 'Handle fell off during first use.', returnDate: '2026-10-25' },
  { code: 'KT-NSC-006', reason: 'Wrong Product', quantity: 5, notes: '3-piece set delivered instead of ordered 5-piece set.', returnDate: '2026-11-05' },

  // Leather Laptop Backpack (AC-LLB-007) - 215 sold, 16 returns = 7.44% -> HEALTHY
  { code: 'AC-LLB-007', reason: 'Quality Issue', quantity: 9, notes: 'Zipper jamming after a week of regular use.', returnDate: '2026-10-15' },
  { code: 'AC-LLB-007', reason: 'Size/Fit', quantity: 7, notes: 'Laptop compartment too tight for 15.6" laptops.', returnDate: '2026-10-29' },

  // Portable Bluetooth Speaker (EL-PBS-008) - 165 sold, 29 returns = 17.57% -> ALERT
  { code: 'EL-PBS-008', reason: 'Damaged', quantity: 11, notes: 'Speaker grille dented in transit. Packaging insufficient.', returnDate: '2026-10-20' },
  { code: 'EL-PBS-008', reason: 'Quality Issue', quantity: 10, notes: 'Battery draining within 2 hours instead of advertised 8 hours.', returnDate: '2026-11-01' },
  { code: 'EL-PBS-008', reason: 'Late Delivery', quantity: 8, notes: 'Gift purchase — Diwali event date passed before arrival.', returnDate: '2026-11-07' },

  // Cotton Bath Towel Set (HM-CBT-009) - 530 sold, 22 returns = 4.15% -> HEALTHY
  { code: 'HM-CBT-009', reason: 'Other', quantity: 12, notes: 'Colour bleeding after first wash. Dye quality issue.', returnDate: '2026-10-22' },
  { code: 'HM-CBT-009', reason: 'Wrong Product', quantity: 10, notes: '4-piece set delivered when 6-piece was ordered.', returnDate: '2026-11-04' }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Return.deleteMany({});
    await Product.deleteMany({});

    // Insert products
    console.log('Inserting demo products...');
    const insertedProducts = await Product.insertMany(PRODUCTS);
    console.log(`Inserted ${insertedProducts.length} products.`);

    // Build product code -> document map
    const productMap = new Map();
    insertedProducts.forEach(p => {
      productMap.set(p.productCode, p);
    });

    // Insert returns, updating product totalReturned as we go
    console.log('Recording demo returns...');
    let returnCount = 0;

    for (const log of RETURN_LOGS) {
      const product = productMap.get(log.code);
      if (!product) {
        console.warn(`Product not found for code: ${log.code}`);
        continue;
      }

      const qty = Number(log.quantity);
      const newTotal = product.totalReturned + qty;

      // Guard against exceeding totalSold
      if (newTotal > product.totalSold) {
        console.warn(`Skipped: ${log.code} — return would exceed totalSold (${newTotal} > ${product.totalSold})`);
        continue;
      }

      // Create return record
      await Return.create({
        productId: product._id,
        reason: log.reason,
        quantity: qty,
        notes: log.notes || '',
        returnDate: new Date(log.returnDate)
      });

      // Update the product totalReturned in memory and database
      product.totalReturned = newTotal;
      await Product.findByIdAndUpdate(product._id, { totalReturned: newTotal });

      returnCount++;
    }

    console.log(`Inserted ${returnCount} return records.`);

    // Ensure default settings (threshold = 10%)
    await Settings.getSettings();
    console.log('Settings initialized with default 10% alert threshold.');

    // Print summary
    console.log('\n--- Seed Summary ---');
    const finalProducts = await Product.find().lean();
    finalProducts.forEach(p => {
      const rate = p.totalSold > 0 
        ? Math.round((p.totalReturned / p.totalSold) * 1000) / 10 
        : 0;
      const status = rate >= 10 ? 'ALERT' : 'HEALTHY';
      console.log(`${p.productCode} | ${p.productName} | ${p.totalSold} sold | ${p.totalReturned} returned | ${rate}% | ${status}`);
    });

    console.log('\nDemo seed complete. ReturnIQ Lite database is ready for demonstration.\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
