const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');


mongoose.connect('mongodb://localhost:27017/xyz', {
    
});

const IndianRecipeSchema = new mongoose.Schema({
    recipe_name: String,
    prep_time: String,
    cook_time: String,
    total_time: String, 
    servings: Number,
    yield: String,
    ingredients: [String], 
    directions: [String],  
    rating: Number,
    description: String,
    url: String,
    cuisine_path: String,
    nutrition: String,
    timing: String,
    img_src: String
});

const IndianRecipe = mongoose.model('IndianRecipe', IndianRecipeSchema);

// Import function
const importIndianRecipes = async () => {
    const recipes = [];
    const csvFilePath = 'indian_recipes.csv'; 

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            console.log('Row Data:', row); 

            try {
                
                const ingredients = row['ingredients_name']
                    ? row['ingredients_name'].split(',').map(item => item.trim())
                    : [];

                
                const directions = row['instructions']
                    ? row['instructions'].split('.').map(item => item.trim()).filter(Boolean) 
                    : [];

                const recipe = new IndianRecipe({
                    recipe_name: row['name'] || '',
                    prep_time: row['prep_time'] || '',
                    cook_time: row['cook_time'] || '',
                    total_time: row['total_time'] || '',
                    servings: parseInt(row['no_of_servings'] || 0),
                    yield: row['yield'] || '',
                    ingredients,
                    directions,
                    rating: parseFloat(row['rating'] || 0),
                    description: row['description'] || '',
                    url: row['url'] || '',
                    cuisine_path: row['cuisine'] || '',
                    nutrition: row['nutrition'] || '',
                    timing: row['timing'] || '',
                    img_src: row['image_url'] || ''
                });

                recipes.push(recipe);
            } catch (error) {
                console.error('Error parsing row:', error.message);
            }
        })
        .on('end', async () => {
            try {
                
                await IndianRecipe.deleteMany({});

                
                const batchSize = 1000;
                for (let i = 0; i < recipes.length; i += batchSize) {
                    const batch = recipes.slice(i, i + batchSize);
                    await IndianRecipe.insertMany(batch);
                    console.log(`Imported ${i + batch.length} recipes`);
                }

                console.log('Import complete!');
                mongoose.connection.close();
            } catch (error) {
                console.error('Import error:', error.message);
                mongoose.connection.close();
            }
        });
};

importIndianRecipes();
