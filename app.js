const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

const PORT = process.env.PORT || 3030;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-claire:Test123@cluster0.0mwwwm0.mongo/todolistDB", {useNewUrlParser: true});

  // Item Schema and Model
   const itemSchema = new mongoose.Schema({
     name: String
   });

   const Item = mongoose.model("Item", itemSchema);

   // Default Items
   const item1 = new Item({
     name: "welcome to your todolist"
   });

   const item2 = new Item({
     name: "hit the + button to add new item"
   });

   const item3 = new Item ({
     name: "<--- hit this to delete an item"
   });

   const defaultItems = [item1, item2, item3];

   // List Schema and Model
   const listSchema = {
     name: String,
     items: [itemSchema]
   };

   const List = mongoose.model("List", listSchema);


// Home Route

app.get("/", function(req, res) {

 Item.find({},function(err, foundItems){

   if (foundItems.length === 0) {

     Item.insertMany(defaultItems, function(err){
       if (err ){
         console.log(err);
       } else {
         console.log("Successfully saved default items to DB.");
       }
     });

     res.redirect("/");

   } else {
     res.render("list", {listTitle: "Today", newListItems: foundItems});
   }

 });

});

app.post("/", function(req, res) {

 const itemName = req.body.newItem;
 const listName = req.body.list;

 const item = new Item ({
   name: itemName
 });

 if (listName === "Today"){
   item.save();
   res.redirect("/");
 } else {
   List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName);
   })
 }

});

// Delete Route

app.post('/delete', function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Item successfully removed from database.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

// Dynamic Route

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err) {
      if (!foundList){
        // Create a new list
        const list = new List({
          name: customListName,
          items:defaultItems
        });
          list.save();
          res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});


// About Route

app.get("/about", function(req, res){

 res.render("about");

});



app.listen(PORT, function() {

 console.log("Server started on port 3000.");

});
