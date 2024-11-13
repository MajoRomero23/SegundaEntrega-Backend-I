const fs = require ('fs');
const path = require ('path');
const productsFilePath = path.join(__dirname, '../../data/products.json');

//Llamar a todos los productos
const getProducts = (req, res) => {
    fs.readFile(productsFilePath, 'utf-8', (err,data) => {
        if (err){
            return res.status(500).json({error: 'Failed to read products file'});
        }
        let products = JSON.parse(data);
        if (req.query.limit){
            products = products.slice(0, parseInt(req.query.limit));
        }
        res.json(products);
    });
};

//Obtener un producto con su ID
const getProductsById = (req, res)=> {
    fs.readFile(productsFilePath, 'utf-8', (err,data) => {
        if (err) {
            return res.status(500).json({error: 'Failed to read products file'});
        }
        const products = JSON.parse(data);
        const product = products.find(p => p.id === parseInt(req.params.pid));
        if (!product){
            return res.status(404).json({ error:'Product not found'});
        }
        res.json(product);
    });
};

//Agregar un nuevo producto    
const addProduct = (req, res) => {
    const {title, description, code, price, status = true, stock, category, thumbnails} = req.body;

    if (!title || !description || !code || !price || !stock || !category){
        return res.status(400).json({error:'Missing required files'});
    }

    fs.readFile(productsFilePath, 'utf-8', (err,data) => {
        if (err){
            return res.status(500).json({error: 'Failed to read products file'});
        }

        let products = JSON.parse(data);
        const newProduct = {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails:thumbnails || []
        };

        products.push(newProduct);

        fs.writeFile(productsFilePath, JSON.stringify(products,null,2),(err) => {
            if (err) {
                return res.status(500).json({error: 'Failed to save product'});
            }

            res.status(201).json(newProduct);
        });
    });
};

// Actualizar un producto que ya existe
const updateProduct = (req, res) => {
    const { pid } = req.params;

    fs.readFile(productsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({error: 'Failed to read products file'});
        }
        let products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === parseInt(pid));

        if (productIndex === -1) {
            return res.status(404).json({error: 'Product not found'});
        }

        if (req.body.id) {
            return res.status(400).json({error: 'Cannot update product ID'});
        }

        const updatedProduct = {...products[productIndex], ...req.body};
        products[productIndex] = updatedProduct;

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).json({error: 'Failed to update product'});
            }
            res.json(updatedProduct);
        });
    });
};


//Eliminar producto 
const deleteProduct = (req, res) => {
    const { pid } = req.params;

    fs.readFile(productsFilePath, 'utf-8', (err,data) =>{
        if (err) {
            return res.status(500).json({error: 'Failed to read producta file'});
        }
        
        let products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === parseInt(pid));

        if (productIndex === -1) {
            return res.status(404).json({error: 'Product not found'});
        }

        products.splice(productIndex, 1);

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).json({error:'Failed to delete product'});
            }
            res.status(204).send();
        });
    });
};

module.exports = {
    getProducts,
    getProductsById,
    addProduct,
    updateProduct,
    deleteProduct
};

