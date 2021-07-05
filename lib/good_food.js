const {Client} = require('pg')   

const puppeteer = require('puppeteer'); 

const client = new Client({
    "port": 5432, 
    "database": "food_recipe"
})  


class Store_recipes {  

   async start() {
        await client.connect()   
        console.log('database connect')
        return true 
    } 

    async all_recipes() { 
        try {
            const result = await client.query('SELECT * FROM list_of_recipes;') 
            return result.rows.map((item) => ( {url_id: item.recipe_id, title: item.title, url_title: item.url_title} ))  
        } 
        catch(e) {
            console.log(e)
        }
    } 

    async new_recipe(title, url) {   
        try {  
                let result = await client.query(`SELECT title FROM list_of_recipes WHERE title = $1`, [title])   
                if (result.rows.length > 0) {
                    return false
                } else {
                    await client.query('INSERT INTO list_of_recipes (recipe_id, title, url_title) VALUES(DEFAULT, $1, $2)', [title, url])   
                    return true
                }
        } 
        catch(e) {
            console.log(e)
        }
    } 

    async delete_recipe(id) {
        try {
            await client.query(`DELETE FROM list_of_recipes WHERE recipe_id = ${id}`) 
            return true
        } 
        catch(e) {
            console.log(e)
        }
    }

}  


class Recipes { 

    async sorting_url(url) { 
        if (url.includes('/')) {
            const new_url = await url.split('/').join('*') 
            return new_url 
        } else {
            const new_url = await url.split('*').join('/') 
            return new_url 
        }
    }

    async recipe_finder(food) { 
        let i = 1 
        const holdering_recipe = [] 
        try {  
            console.log(food)
            const brower = await puppeteer.launch(); 
            const page = await brower.newPage();  
            await page.goto('https://www.bbcgoodfood.com/search/recipes?q=' + food) 

            while(i <= 20) {
                
                const [el] = await page.$x(`//*[@id="main-content"]/form/div/div[4]/div[1]/div[1]/div/div[${i}]/div/div[2]/div[1]/h4/a`)  
                const [el1] = await page.$x(`//*[@id="main-content"]/form/div/div[4]/div[1]/div[1]/div/div[${i}]/div/div[2]/div[3]/a`) 
                const [el2] = await page.$x(`//*[@id="main-content"]/form/div/div[4]/div[1]/div[1]/div/div[${i}]/div/div[1]/a/img`) 

                const txt = await el.getProperty('textContent') 
                const txt1 = await el1.getProperty('textContent')   
                const txtsrc = await el2.getProperty('src') 
                const href = await el.getProperty('href')  
                const changed_url = await recipes.sorting_url(await href.jsonValue()) 

                holdering_recipe.push({title: await txt.jsonValue(), img: await txtsrc.jsonValue(), describe: await txt1.jsonValue(), link: changed_url});   

                i++
            } 

            await brower.close(); 
            return {holdering_recipe} 

        
        } 
        catch(err) {
            console.log(err)
        }
    }  

    async recipe_ingredients(url) { 

        const new_list = []  
        let arr = [] 
        let arr2 = [] 
        let arr3 = []

        try { 
            let original_url = await recipes.sorting_url(url)

            const brower = await puppeteer.launch(); 
            const page = await brower.newPage();  
            await page.goto(original_url)   

            const [h1] = await page.$x('//*[@id="__next"]/div[3]/main/div/section/div/div[3]/h1')
            const [el] = await page.$x('//*[@id="__next"]/div[3]/main/div/div/div[1]/div[1]/div[2]/div[2]/div/section[1]') 
            const [el1] = await page.$x('//*[@id="__next"]/div[3]/main/div/div/div[1]/div[1]/div[2]/div[2]/div/section[2]/div/ul') 
            const [el2] = await page.$x('//*[@id="__next"]/div[3]/main/div/section/div/div[3]/ul[1]')   
            const [img] = await page.$x('//*[@id="__next"]/div[3]/main/div/section/div/div[1]/div/div/picture/img')

            const txt_header = await h1.getProperty('textContent')
            const txt_ing = await el.getProperty('textContent')  
            const txt_des = await el1.getProperty('textContent') 
            const txt_info = await el2.getProperty('textContent')   
            const txt_img = await img.getProperty('src')

            let Header = await txt_header.jsonValue()
            let info = await txt_info.jsonValue()
            let list = await txt_ing.jsonValue()      
            let descript = await txt_des.jsonValue()  
            let img1 = await txt_img.jsonValue()

            const descript2 = descript.split('STEP').map((item) => item.length > 0 ? item.slice(1, 2)  + ': ' + item.slice(2, -1) + '.' : null )    
           
            const info2 = info.split(' ').slice(3, -1)   

            info2.forEach((item, i) => ( i >= 2 ? arr.push(item) : arr2.push(item) ))  
            
            arr2.push(arr.join(' '))   

            arr2.forEach((item, i) => {
               if (i === 0) {
                arr3.push(`Prep Time : ${item.slice(9)}`)
               } else if (i === 1) {
                arr3.push(`Cooking Time : ${item.slice(9)}`)
               } else {
                arr3.push(item.slice(4))
               }
            })

            descript2.shift()

            let list2 = list.slice(11, -1).split(', ') 

            await brower.close();  

            new_list.push({list_ingredients: list2, res_img: img1, descript: descript2, info: arr3, header_one: Header, current_url: url})  

            return new_list

        } 
        catch(e) {
            console.log(e)
        }
    }

}    

module.exports = {
    Recipes : Recipes,  
    Store_recipes : Store_recipes
}  

store = new Store_recipes 
store.start()   

recipes = new Recipes
