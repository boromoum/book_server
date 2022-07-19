const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const items = require('./data.json')

const app = express()
const port = 3000

let books = items;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




app.use((req, res, next) => {
    const auth = {
        login: 'admin',
        password: '123'
    }
    const [, b64auth = ''] = (req.headers.authorization || '').split(' ')
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    if (login && password && login === auth.login && password === auth.password) {
        return next()
    }
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Authentication required.')
})


//add new book
app.post('/books', (req, res) => {
    const book = req.body;
    console.log(book);
    books.push(book);

    res.send('Book is added to the database');
});

//get all books
app.get('/books', (req, res) => {
    res.json(books);
});

// get paginated results
app.get("/books/paginate", paginatedResults(books), (req, res) => {
    res.json(
        res.paginatedResults);
});

function paginatedResults(model) {
    return (req, res, next) => {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        const startIndex = (page - 1) * size;
        const endIndex = page * size;

        const content = {
            totalElements: model.length,
            page: page,
            size: size,
            totalPages: model.length / size
        };

        content.content = model.slice(startIndex, endIndex);

        res.paginatedResults = content;
        next();
    };
}

//get book by id
app.get('/book/:id', (req, res) => {
    const id = parseInt(req.params.id);
    for (let book of books) {
        if (book.id === id) {
            res.json(book);
            return;
        }
    }

    res.status(404).send('Book not found');
});


app.listen(port, () => console.log(`Book app listening on port ${port}!`));

