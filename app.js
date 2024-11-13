const express = require ('express');
const cors = require ('cors');
const {create} = require ('express-handlebars');
const path = require ('path');
const http = require ('http');
const fs = require ('fs');
const {Server} = require('socket.io');
const productsRouter = require ('./src/routes/productsRouter');
const cartsRouter = require ('./src/routes/cartsRouter');

const app = express();
const PORT = 8080;

const server = http.createServer(app);
const io = new Server(server);

const hbs = create({
    extname: 'handlebars',
    defaultLayout: 'main'
});

app.engine('handlebars',hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));

app.use(cors());

app.use(express.static(path.join(__dirname,'../public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

let products = [];

fs.readFile(path.join(__dirname, './data/products.json'), 'utf-8', (err, data) => {
    if(err) {
        console.error('Error al leer el archivo products.json', err);
        return;
    }
    products = JSON.parse(data);
});

app.get('/products', (req,res)=> {
    res.render ('index', {products});
});

app.get('/', (req, res) => {
    res.render('index', { products });
});

app.get('/realtimeproducts', (req, res) => {
    res.render ('realTimeProducts');
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.emit('productList', products);

    socket.on('newProduct', (product) => {
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            ...product
        };
        products.push(newProduct);
        io.emit('productList', products);

        fs.writeFile(path.join(__dirname, './data/products.json'), JSON.stringify(products, null, 2), (err) => {
            if (err) {
                console.error ('Error al guardar el producto en products.json', err);
            }
        });
    });

    socket.on('deleteProduct', (productId) => {
        products = products.filter(p => p.id !== productId);
        io.emit('productList', products);

        fs.writeFile(path.join(__dirname,'./data/products.json'), JSON.stringify(products, null, 2), (err) => {
            if (err){
                console.error('Error al eliminar el producto de products.json', err);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.use(express.json());

// app.use('/api/carts', cartsRouter);
// app.use('/api/products', productsRouter);

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
