const mongoose = require('mongoose');
const Category = require('./models/Category');

mongoose.connect('mongodb://127.0.0.1:27017/cloths_shop').then(async () => {
    const initialCategories = [
        { name: 'Men', description: 'Clothing for men' },
        { name: 'Women', description: 'Clothing for women' },
        { name: 'Kids', description: 'Clothing for kids' },
        { name: 'Unisex', description: 'Clothing for everyone' },
        { name: 'Men Accessories', description: 'Accessories for men' },
        { name: 'Women Accessories', description: 'Accessories for women' },
        { name: 'Women Cosmetic', description: 'Cosmetics for women' }
    ];

    for (const cat of initialCategories) {
        const exists = await Category.findOne({ name: cat.name });
        if (!exists) {
            await new Category(cat).save();
            console.log(`Created category: ${cat.name}`);
        } else {
            console.log(`Category already exists: ${cat.name}`);
        }
    }

    console.log('Finished seeding categories.');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
