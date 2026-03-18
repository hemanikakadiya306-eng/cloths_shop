const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/cloths_shop').then(async () => {
    // Rename Women Cosmetics -> Women Cosmetic
    const cat = await Category.findOne({ name: 'Women Cosmetics' });
    if (cat) {
        cat.name = 'Women Cosmetic';
        await cat.save();
        console.log('Renamed Category to Women Cosmetic');
    }

    const existing = await Category.findOne({ name: 'Women Cosmetic' });
    if (!existing && !cat) {
        await new Category({ name: 'Women Cosmetic', description: 'Cosmetics for women' }).save();
        console.log('Created Women Cosmetic');
    }

    // Also update any products that were mistakenly added
    await Product.updateMany({ category: 'Women Cosmetics' }, { $set: { category: 'Women Cosmetic' } });

    console.log('Finished updating categories.');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
