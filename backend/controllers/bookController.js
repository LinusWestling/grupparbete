const bookService = require('./../services/bookService');

exports.getBooks = (async(req, res) => {
    try {
        const books = await bookService.getBooks();
        res.json({books});
    }catch(error){
        return res.status(500).json({
            error: error.message
        });
    }
});


exports.getBook = (async(req, res) => {
    const { id } = req.params;
    console.log('param' + id);

    try {
        const book = await bookService.getBook(id);
        res.json({book});
    }catch(error){
        return res.status(500).json({
            error: error.message
        });
    }
});

exports.createBook = (async(req, res) => {
    const { bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId } = req.body;

    if (!bokIsbn || bokIsbn.trim().length < 1) {
        return res.status(400).json({
            success: false,
            error: 'Du har inte skrivit in något ISBN för boken',
        });
    }

    try{
        await bookService.createBook(bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId);
        return res.status(201).json({
            success: true,
            error: '',
            message: 'Du har lagt till en ny bok!'
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

exports.updateBook = (async(req, res) => {
    const { bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId, bokId } = req.body;

    if (!bokIsbn || bokIsbn.trim().length < 1) {
        return res.status(400).json({
            success: false,
            error: 'Du har inte skrivit in något ISBN för boken',
        });
    }

    if (!bokId) {
        return res.status(400).json({
            success: false,
            error: 'Du har inte skrivit in något ID för boken du ska uppdatera!',
        });
    }

    try{
        await bookService.updateBook(bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId, bokId);
        return res.status(201).json({
            success: true,
            error: ''
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

exports.deleteBook = (async(req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Du har inte skrivit in något ID för boken du ska radera!',
        });
    }

    try{
        await bookService.deleteBook(id);
        return res.status(201).json({
            success: true,
            error: '',
            message: 'Boken är nu raderad!'
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
