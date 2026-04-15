/**
 * Seed script - Creates default admin user and sample products
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...\n');

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'admin@spis.com' });
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@spis.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created:');
      console.log('   Email: admin@spis.com');
      console.log('   Password: admin123\n');
    } else {
      console.log('ℹ️  Admin user already exists\n');
    }

    // Create sample products
    const sampleProducts = [
      {
        code: 'BOOST-001',
        name: 'Boost Health Drink',
        brand: 'Boost',
        ingredients: 'Malt extract, Sugar, Milk solids, Cocoa solids, Minerals, Vitamins',
        mfg_date: new Date('2026-02-10'),
        expiry_date: new Date('2027-02-10'),
        allergens: 'Milk, Gluten',
        nutrition: 'Energy: 377 kcal, Protein: 7g, Carbs: 85g, Fat: 2g per 100g',
        usage: 'Add 2 teaspoons to a glass of hot or cold milk. Stir well.',
        warnings: 'Store in cool, dry place. Keep away from direct sunlight.',
        category: 'Beverages'
      },
      {
        code: 'MAGI-002',
        name: 'Maggi 2-Minute Noodles',
        brand: 'Nestlé',
        ingredients: 'Wheat flour, Palm oil, Salt, Sugar, Spices, Onion powder, Garlic powder',
        mfg_date: new Date('2026-01-15'),
        expiry_date: new Date('2026-07-15'),
        allergens: 'Wheat, Soy',
        nutrition: 'Energy: 386 kcal, Protein: 9g, Carbs: 56g, Fat: 15g per 100g',
        usage: 'Boil 2 cups of water. Add noodles and tastemaker. Cook for 2 minutes.',
        warnings: 'Contains wheat and soy. May contain traces of peanuts.',
        category: 'Food'
      },
      {
        code: 'DETTOL-003',
        name: 'Dettol Antiseptic Liquid',
        brand: 'Dettol',
        ingredients: 'Chloroxylenol 4.8%, Pine oil, Castor oil, Isopropyl alcohol',
        mfg_date: new Date('2025-11-01'),
        expiry_date: new Date('2027-11-01'),
        allergens: 'None',
        nutrition: 'Not applicable',
        usage: 'Dilute with water. For wounds: 1 cap in 1 cup water. For bathing: 1 cap in a mug of water.',
        warnings: 'FOR EXTERNAL USE ONLY. Keep out of reach of children. Do not swallow.',
        category: 'Healthcare'
      },
      {
        code: 'AMUL-004',
        name: 'Amul Butter',
        brand: 'Amul',
        ingredients: 'Milk fat, Common salt, Permitted natural color (Annatto)',
        mfg_date: new Date('2026-03-01'),
        expiry_date: new Date('2026-05-01'),
        allergens: 'Milk',
        nutrition: 'Energy: 720 kcal, Protein: 0.7g, Carbs: 0.6g, Fat: 80g per 100g',
        usage: 'Spread on bread, toast, or use in cooking. Refrigerate after opening.',
        warnings: 'Contains milk. Keep refrigerated at 2-8°C.',
        category: 'Dairy'
      },
      {
        code: 'COLGATE-005',
        name: 'Colgate MaxFresh Toothpaste',
        brand: 'Colgate',
        ingredients: 'Sorbitol, Water, Hydrated silica, Sodium lauryl sulfate, Fluoride, Menthol',
        mfg_date: new Date('2026-01-20'),
        expiry_date: new Date('2028-01-20'),
        allergens: 'None',
        nutrition: 'Not applicable',
        usage: 'Brush teeth thoroughly twice daily or as directed by a dentist.',
        warnings: 'Do not swallow. Keep out of reach of children under 6. If more than used for brushing is accidentally swallowed, get medical help.',
        category: 'Personal Care'
      },
      {
        code: 'EXPIRED-006',
        name: 'Old Expired Juice',
        brand: 'TestBrand',
        ingredients: 'Apple juice concentrate, Water, Sugar, Citric acid',
        mfg_date: new Date('2024-01-01'),
        expiry_date: new Date('2025-01-01'),
        allergens: 'None',
        nutrition: 'Energy: 50 kcal, Sugar: 12g per 100ml',
        usage: 'Shake well before use. Serve chilled.',
        warnings: 'Refrigerate after opening. Consume within 3 days.',
        category: 'Beverages'
      }
    ];

    for (const productData of sampleProducts) {
      const exists = await Product.findOne({ code: productData.code });
      if (!exists) {
        await Product.create(productData);
        console.log(`✅ Created product: ${productData.name} (${productData.code})`);
      } else {
        console.log(`ℹ️  Product already exists: ${productData.name}`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
