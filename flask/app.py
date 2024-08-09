from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow all origins by default

# Load the pre-trained model and vectorizer
knn = joblib.load('knn_model.pkl')
vectorizer = joblib.load('vectorizer.pkl')
df = pd.read_csv('dish_dataset.csv', encoding='latin-1')

def process_ingredients(ingredients):
    # Convert all ingredients to lowercase
    return set(ingredient.lower() for ingredient in ingredients.split(', '))

@app.route('/recommend', methods=['POST'])
def recommend():
    # Normalize user ingredients to lowercase
    user_ingredients = request.json.get('ingredients').lower()
    user_vector = vectorizer.transform([user_ingredients])
    distances, indices = knn.kneighbors(user_vector)

    results = []
    user_ingredients_set = process_ingredients(user_ingredients)

    for idx in indices.flatten():
        recipe_ingredients_set = process_ingredients(df.iloc[idx]['Ingredients (Tagalog)'])
        missing_ingredients = recipe_ingredients_set - user_ingredients_set
        unnecessary_ingredients = user_ingredients_set - recipe_ingredients_set

        image_filename = df.iloc[idx]["Image Name"]

        results.append({
            'Dish Name': df.iloc[idx]['Dish Name'],
            'Ingredients': df.iloc[idx]['Ingredients (Tagalog)'],
            'Instructions': df.iloc[idx]['Instructions'],
            'Image Filename': image_filename,
            'Missing Ingredients': ', '.join(missing_ingredients) if missing_ingredients else 'None',
            'Unnecessary Ingredients': ', '.join(unnecessary_ingredients) if unnecessary_ingredients else 'None'
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Flask running on port 5001
