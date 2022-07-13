//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Edilson:17Edilson17@cluster0.m8wdd.mongodb.net/todolistDB");

const itensEsquema = new mongoose.Schema({
  nome: String,
});

const Item = new mongoose.model("Item", itensEsquema);

const item1 = new Item({
  nome: "Bem vindo ao seu To Do List!"
});

const item2 = new Item({
  nome: "Clique no botão + para adicionar uma nova tarefa."
});

const item3 = new Item({
  nome: "<-- Clique para remover um item."
});

const ItensPadrao = [item1, item2, item3];

const esquemaListas = {
  nome: String,
  itens: [itensEsquema]
};

const Lista = mongoose.model("Lista", esquemaListas);

app.get("/", function(req, res) {

  Item.find({}, function (err, itensEncotrados) {

    if (itensEncotrados.length === 0) {
      Item.insertMany(ItensPadrao, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Salvo com sucesso a base de dados!");
        }
      });
      res.redirect("/");   
    } else {
      res.render("lista", {tituloLista: "Hoje", novaListaItens: itensEncotrados});
    }
  });
});

app.post("/", function(req, res){

  const nomeItem = req.body.novoItem;
  const nomeLista = req.body.lista;

  const item = new Item({
    nome: nomeItem
  });

  if (nomeLista === "Hoje") {
    item.save();
    res.redirect("/");
  } else {
    Lista.findOne({nome: nomeLista}, function (err, itensEncotrados) {
      itensEncotrados.itens.push(item);
      itensEncotrados.save();
      res.redirect("/" + nomeLista);
    });
  }
  
  
});

app.post("/deletar", function (req, res) {
  const itemChecadoId = req.body.checkbox;
  const listaNome = req.body.listaNome;

  if (listaNome === "Hoje") {
    Item.findByIdAndRemove(itemChecadoId, function (err) {
      if (!err) {
        console.log("Removido com sucesso!");
        res.redirect("/");
      }
    });
  } else {
    Lista.findOneAndUpdate(
      {nome: listaNome},
      {$pull: 
        {itens: {_id: itemChecadoId}}},
        function (err, intesEncotrados) {
          if (!err) {
            res.redirect("/" + listaNome);
          }
        }
      );
  }

});

app.get("/:nomeListaCustomizada", function (req, res) {
  const nomeListaCustomizada = _.capitalize(req.params.nomeListaCustomizada);

  Lista.findOne({nome: nomeListaCustomizada}, function (err, itensEncotrados) {
    if (!err) {
      if (!itensEncotrados) {
        const lista = new Lista({
          nome: nomeListaCustomizada,
          itens: ItensPadrao
        });
        lista.save();
        res.redirect("/" + nomeListaCustomizada);
      } else {
        res.render("lista",  {tituloLista: itensEncotrados.nome, novaListaItens: itensEncotrados.itens})
      }
    }
  });

  
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Servidor iniciou com sucesso!");
});
