# Clothing Warehouse

## Purpose

A simple product availability listing app for a fictional clothing warehouse. Job application assignment using React, JavaScript and CSS.

## Installation

```
git clone https://github.com/Raichan/clothing-warehouse.git
cd clothing-warehouse
npm install
npm start
```

The app will run at `localhost:3000`.

There is also a running demo at http://clothing-warehouse-demo.herokuapp.com/.

## Usage

- By clicking the category icons in the navigation bar, the app fetches a list of products and their availabilities. The availability status for each product row is shown by the icon on the right.
- You can use the search bar to filter by product name. The search is case insensitive.
- The product information is saved in the app state, so a category won't be loaded again from the API unless the user clicks the refresh button.
- The app uses an unreliable availability API that occasionally returns the response code 200 but an empty list. In this case, the request is repeated twice before throwing an error. If the call fails even after all three tries, click refresh to reload availability data.

## Possible improvements

- It is currently assumed that the stock doesn't change often so constant refreshing isn't necessary. Could be improved to suit a warehouse where availability constantly changes.
- Currently the old availability data is visible while refreshing, which may be confusing for the user.
- To improve speed, add pagination or some other way to not have to render the full list at once.
