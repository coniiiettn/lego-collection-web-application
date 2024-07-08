require('dotenv').config();

const Sequelize = require('sequelize');
// const setData = require("../data/setData");
// const themeData = require("../data/themeData");

//set up sequelize to point to our postgres database
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  }
});

// Theme model
const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "id" as a primary key
      autoIncrement: true, // automatically increment the value

    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

// Set model
const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true, // use "set_num" as a primary key
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);
//2.	Delete the code to read the JSON files / initialize an empty "sets" array:

// create an association between the two
Set.belongsTo(Theme, {foreignKey: 'theme_id'})

// Note, extra wrapper promises added for simplicity and greater control over error messages

function initialize() { 
  return new Promise(async (resolve, reject) => {
    try{
      await sequelize.sync();
      resolve();
    }catch(err){
      reject(err.message)
    }
  });

}

function getAllSets() {

  return new Promise(async (resolve, reject) => {
    try {
      let sets = await Set.findAll({ include: [Theme] });
      resolve(sets);
    } catch (err) {
      reject(err.message);
    }
  });
   
}

//add	getAllThemes() function
//return all the themes from the database
function getAllThemes() {

  return new Promise(async (resolve, reject) => {
    
    try {
      let themes = await Theme.findAll();
      resolve(themes);
    } catch (err) {
      reject(err.message);
    }
    
   
  });
   
}

function getSetByNum(setNum) {

  return new Promise(async (resolve, reject) => {
    let foundSet = await Set.findAll({include: [Theme], where: { set_num: setNum}});
 
    if (foundSet.length > 0) {
      resolve(foundSet[0]);
    } else {
      reject("Unable to find requested set");
    }

  });

}

function getSetsByTheme(theme) {

  return new Promise(async (resolve, reject) => {
    let foundSets = await Set.findAll({include: [Theme], where: { 
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }});
 
    if (foundSets.length > 0) {
      resolve(foundSets);
    } else {
      reject("Unable to find requested sets");
    }

  });

}

// function addSet(setData){
//   return new Promise(async (resolve,reject)=>{
//     try{
//       await Set.create(setData);
//       resolve();
//     }catch(err){
//       reject(err.errors[0].message)
//     }
//   });
// }

//add addSet(setData) function
function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      let newSet = await Set.create(setData);
      resolve(newSet); // Resolve with the newly created set
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        reject(err.errors[0].message); // Reject with the first error message
      } else {
        reject(err.message); // Otherwise, reject with the general error message
      }
    }
  });
}


//editSet(set_num, setData) function

function editSet(set_num, setData){
  return new Promise(async (resolve,reject)=>{
    try {
      let updatedSet = await Set.update(setData,{where: {set_num: set_num}})
      resolve(updatedSet);
    }catch(err){
      if (err.errors && err.errors.length > 0) {
        reject(err.errors[0].message); // Reject with the first error message if available
      } else {
        reject(err.message); // Otherwise, reject with the general error message
      }    }
  });
}

function deleteSet(set_num){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.destroy({
        where: { set_num: set_num }
      });
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
   
  });
  
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet };

// NOTE: If you receive the error:

      // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

      // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".

      // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
// sequelize
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);
// 
//       
//     }
// 
//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });
