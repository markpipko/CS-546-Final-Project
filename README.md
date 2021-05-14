# CS-546-Final-Project | Paper Trader
Paper Trader is a paper trading application that allows users to buy and sell stocks from the stock market. Users are able to modify their portfolio of real-time valued stocks by searching for a given stock, purchasing it, selling it, or monitoring its status. Upon the user's actions, their user portfolio metrics will also be updated based on these decisions. 

Built using HTML, CSS, Bootstrap, Express, Node.js, and MongoDB.

GitHub Link: https://github.com/markpipko/CS-546-Final-Project

## How to Run
1. Run "npm install" to install the required dependencies for the project
2. Run "npm run seed" to seed the database.

Seeded Users:

User 1:
email - ed@yar.com
password - epass

User 2:
email - mark@pipko.com
password - mpass

User 3:
email - chris@moon.com
password - cpass

User 4:
email - patrick@hill.com
password - password

User 5:
email - test@test.com
password - test

## How the Application Works
1. Upon loading the website, the first page will be the login page where a user will be able to either login or sign up.
2. A non-authenticated user will not be able to access any of the website besides the login and signup page.
3. Once logged in, a user is able to see their current portfolio as well as a graph of the user's performance. 
4. Users can also search for a stock through the search box and the corresponding information for that stock will be displayed, which includes the price, volume, recommendation, etc. From here, users can buy/sell in shares/dollars.
5. Additionally, users can look at their buy/sell history, recommendations and favorites, or edit their account info through the navigation bar. 

## Extra Features
1. Sharing to Social Media after buying or selling
2. Stock recommendations
3. Dark mode when markets close
4. Favorites List

