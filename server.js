import express from "express";
import router from "./router.js";
import {connect} from "mongoose";

connect("mongodb+srv://emi:j1fm6ccYoK8Gno8w@cluster0.mf1ujrr.mongodb.net/Paris")
    .then(function(){
        console.log("Connexion MongoDB réussie")
    })
    .catch(function(err){
        console.log(new Error(err))
    })

const app = express();
const PORT = 1235;

app.use(express.json());

app.use(router);

app.listen(PORT,function() {
    console.log(`Serveur express d'écoute sur le port ${PORT}`)
})