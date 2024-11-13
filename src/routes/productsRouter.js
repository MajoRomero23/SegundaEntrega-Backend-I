const express = require('express');
const fs = require('fs');
const path = require ('path');
const router = express.Router();

const productsFilePath = path.join(__dirname,'../../data/products.json');

//Para obtener todos los productos
router.get('/', (req,res)=>{
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({error:'Error al leer el archivo de productos'});
        }
        const products = JSON.parse(data);
        res.json(products);
    });
});

//Para llamar a un producto por su ID
router.get ('/:pid', (req,res)=> {
    fs.readFile(productsFilePath, 'utf-8', (err,data) => {
        if (err) {
            return res.status(500).json({error: 'Error al leer el archivo de productos'});
        }
        const products = JSON.parse(data);
        const product = products.find (p => p.id === parseInt(req.params.pid));
        if (!product) {
            return res.status(404).json ({error: 'Producto no encontrado'});
        }
        res.json(product);
    });
});

//Para agregar un producto nuevo 
router.post ('/', (req, res) => {
    const {title, description, code, price, stock, category, thumbnails} = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json ({error:'Por favor revisa y completa todos los campos'});
    }
    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer archivo de productos'});
        }

        const products = JSON.parse(data);
        const newProduct = {
            id: products.lenght > 0 ? products[products.lenght - 1].id + 1 : 1,
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails:thumbnails || []
        };

        products.push (newProduct);

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).json({error: 'Error al guardar el producto'});
            }
            res.status(201).json(newProduct);
        });
    });
}),


module.exports=router;