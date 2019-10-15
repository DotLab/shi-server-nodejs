const Poem = require('../models/Poem');
const User = require('../models/User');
// const {serializeUser} = require('../models/User');
const {apiError, apiSuccess} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');


exports.listing = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);

  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }

  let poets = [];
  // q: search content
  // sort: all items sort, with order = order
  // year: search criteria

  if (params.q != 'undefined' && params.q !='') {
    console.log('has q', params.q);
    const poet = await User.find({displayName: params.q});
    poets.push(serializeUser(poet));
    return apiSuccess(poets);
  } else if (params.year != 'undefined' && params.year !='') {
    // console.log('has year', params.year);

    // const date = new Date(params.year + '-12-31');

    // console.log(date);
    // const poems = await Poem.find({dateWritten: {$lte: {date}}});

    // poems.forEach((poem) => {
    //   poets.push( User.find({id: poem.author}));
    // });

    return apiSuccess(poets);
  } else if (params.sort != 'undefined') { // sort of done. need serilize
    console.log('has sort', params.sort);
    if (params.sort === 'date') {
      if (params.order === 'desc') {
        const collections = await Poem.find({}).sort({dateWritten: -1}).distinct('author');
        console.log(collections);

        if (!collections) {
          return apiError('Fail');
        }
        for (let i = 0; i < collections.length; i++) {
          const p = await User.findById(collections[i]);
          poets.push(serializeUser(p));
        }

        return apiSuccess(poets);
      } else {
        const collections = await Poem.find({}).sort({dateWritten: 1});
        const dict = {};
        for (let i = 0; i < collections.length; i++) {
          const p = await User.findById(collections[i].author);
          dict[serializeUser(p)] = 1;
        }
        poets = Object.keys(dict);

        return apiSuccess(poets);
      }
    } else if (params.sort === 'likes') {
      if (params.order === 'desc') {
        const collections = await User.find({}).sort({followingCount: -1});
        collections.forEach((p) => poets.push(p));
        return apiSuccess(poets);
      } else {
        const collections = await User.find({}).sort({followingCount: 1});
        collections.forEach((p) => poets.push(p));
        return apiSuccess(poets);
      }
    } else if (params.sort === 'alphabetical') { // works
      if (params.order === 'desc') {
        const collections = await User.find({}).sort({displayName: -1});
        collections.forEach((p) => poets.push(p));
        return apiSuccess(poets);
      } else {
        const collections = await User.find({}).sort({displayName: 1});
        collections.forEach((p) => poets.push(p));
        return apiSuccess(poets);
      }
    } else {
      return apiError('Invalid query');
    }
  } else {
    const following = user.following;
    for (let i = 0; i < user.followingCount; i++) {
      const collections = await User.findById(following[i]._id);
      poets.push(serializeUser(collections));
    }
    return apiSuccess(poets);
  }

  // else if (params.sort === 'views') {
  // }
};


function serializeUser(user) {
  const {
    id,
    userName, displayName, followingCount, following, followerCount, follower,
  } = user;
  return {
    id,
    userName, displayName, followingCount, following, followerCount, follower,
  };
}
