import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import searchView from './views/searchView.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecepieView from './views/addRecepieView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    //0 update results view to martk selected search result
    resultsView.update(model.getSearchResultsPage());

    //updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //1. loading recepi
    await model.loadRecipe(id);

    //2. rendering recepi

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //1 get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2 load search results
    await model.loadSearchResults(query);

    //3 render results

    resultsView.render(model.getSearchResultsPage());
    //4 render pagination buutons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //render new pagination buttonss
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recepie servings(in state)
  model.updateServings(newServings);
  //update the recepie view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add /remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recepi view
  recipeView.update(model.state.recipe);
  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecepieView.renderSpinner();

    //upload nre recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success mesage
    addRecepieView.renderMessage();

    //render bookmark view

    bookmarksView.render(model.state.bookmarks);
    //change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back() --back to prew page

    //close form window
    setTimeout(() => {
      addRecepieView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`🧨`, err);
    addRecepieView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecepieView.addHandlerUploud(controlAddRecipe);
};
init();
