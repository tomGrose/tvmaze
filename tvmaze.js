/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  let showList = [];
  const results = await axios.get("http://api.tvmaze.com/search/shows", {params: {q:query}});
  const data = results.data;
  for (showData of data) {
    let showImg = null;
    showImg = !showData.show.image.original ? "https://tinyurl.com/tv-missing" : showData.show.image.original;
    showList.push({
      id: showData.show.id,
      name: showData.show.name,
      summary: showData.show.summary,
      image: showImg
    })
  }
  return showList;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <img class="card-img-top" src="${show.image}">
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary">See Episodes</button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const results = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodes = results.data.map((val) => {
    return {
      id: val.id,
      name: val.name,
      season: val.season,
      number: val.number
    }
  });
  return episodes;
}

//recieves an array of episodes. creates a ul from those episodes and appends them to them dom
function populateEpisodes(episodes){
  const $epsList = $("#episodes-list");
  $epsList.empty();
  for (ep of episodes) {
    let $episode = $(`<li>${ep.name} (season: ${ep.season} number: ${ep.number})</li>`);
    console.log($episode);
    $epsList.append($episode);
  }
  $("#episodes-area").show();
}

//create an event handler to show thge episodes a show has when clicked
$( "#shows-list" ).on( "click", "button", async function(e){
  const showId = $(this).closest(".Show").data("showId");
  let episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
})
