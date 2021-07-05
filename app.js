let Main = require('./lib/good_food')   

let recipe = new Main.Recipes

let store_recipes = new Main.Store_recipes

const express = require('express')    

var session = require('express-session')    

const app = express()      

app.set('view engine', 'ejs');

app.use(express.json()) 

app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public')); 

app.use(session({
    secret: 'secret-key', 
    resave: false, 
    saveUninitialized: false,
}));    

app.use(express.static('public'));    

app.get('/', async function(res, req) {     
    let recipe_outcome; 
    session.food === undefined ? recipe_outcome = await recipe.recipe_finder('cake') : recipe_outcome = await recipe.recipe_finder(session.food)  
    req.render('index', {recipe: recipe_outcome.holdering_recipe})  
})  

app.post('/search', function(res, req) { 
    session.food = res.body.food 
    req.redirect('/')
})

app.post('/food/:url', async function(res, req) {  
    const url = res.params.url   
    let one_recipe = await recipe.recipe_ingredients(url)    
    req.render('ingredients', {recipe: one_recipe[0], error: ''})
}) 

app.get('/back', async function(res, req) {
    req.redirect('/')
})  

app.post('/save/:header/:url', async function(res, req) {   
    let result = await store_recipes.new_recipe(res.params.header, res.params.url)  
    const url = res.params.url
    let one_recipe = await recipe.recipe_ingredients(url)    
    result === true ? req.render('ingredients', {recipe: one_recipe[0], error: ''}) : req.render('ingredients', {recipe: one_recipe[0], error: 'Recipe has already been saved'}) 
})  

app.post('/delete/:id', async function(res, req) { 
    await store_recipes.delete_recipe(res.params.id) 
    console.log('--Recipe Delete:)--')
    req.redirect('/saved_recipe')
})

// This will need to be updated. 

// work on this later 
app.get('/saved_recipe', async function(res, req) {
    const result = await store_recipes.all_recipes() 
    req.render('saved_recipe', {recipes: result})
}) 

app.listen(3000, () => {
    console.log('Server is now running') 
})  

