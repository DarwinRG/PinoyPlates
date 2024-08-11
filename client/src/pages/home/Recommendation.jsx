const RecipeRecommendations = ({ recommendations }) => {
  return (
    <div className="recipe-container">
      {recommendations.length > 0 && 
        recommendations.map((recipe, index) => (
          <div key={index} className="recipe">
            <img
              src={`${recipe['Image Filename']}`} 
              alt={recipe['Dish Name']}
            />
            <h2>{recipe['Dish Name']}</h2>
            <p><strong>Ingredients:</strong> {recipe['Ingredients']}</p>
            <p><strong>Instructions:</strong> {recipe['Instructions']}</p>
            {recipe['Missing Ingredients'] && (
              <p className="missing-ingredients">
                Missing Ingredients: {recipe['Missing Ingredients']}
              </p>
            )}
            {recipe['Unnecessary Ingredients'] && (
              <p className="unnecessary-ingredients">
                Unnecessary Ingredients: {recipe['Unnecessary Ingredients']}
              </p>
            )}
          </div>
         ))}
    </div>
  )
}


export default RecipeRecommendations
