-- first database with table 

CREATE TABLE list_of_recipes ( recipe_id serial PRIMARY KEY, title VARCHAR ( 300 ) NOT NULL, url_title VARCHAR ( 300 ) NOT NULL ); 

-- insert into database one table 

INSERT INTO list_of_recipes (title, url_title) VALUES('Beef currey', 'https://www.bbcgoodfood.com/recipes/beef-curry');  

INSERT INTO list_of_recipes (title, url_title) VALUES('Chocolate marble cake', 'https://www.bbcgoodfood.com/recipes/chocolate-marble-cake');  

INSERT INTO list_of_recipes (title, url_title) VALUES('Macaroni cheese lasgne', 'https://www.bbcgoodfood.com/recipes/macaroni-cheese-lasagne');

-- psql postgres