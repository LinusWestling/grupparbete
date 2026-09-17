const connectionMySQL = require('./../connectionMySQL');

function getBooks() {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM bok';
        connectionMySQL.query(sql, (err, rows) => {
            if(err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

function getBook(id) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM bok WHERE bokId = ?';
        connectionMySQL.query(sql, [id], (err, rows) => {
            if(err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

function createBook(bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId) {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO bok (bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId) VALUES (?,?,?,?,?)';
        let params = [bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId];

        connectionMySQL.query(sql, params, (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

function updateBook(bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId, bokId) {
    return new Promise((resolve, reject) => {
        let sql = 'UPDATE bok SET bokForfattare = ?, bokTitel = ?, bokIsbn = ?, bokPris = ?, bokKategoriId = ? WHERE bokId = ?';
        let params = [bokForfattare, bokTitel, bokIsbn, bokPris, bokKategoriId, bokId];

        connectionMySQL.query(sql, params, (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

function deleteBook(id) {
    return new Promise((resolve, reject) => {
        let sql = 'DELETE FROM bok WHERE bokId = ?';

        connectionMySQL.query(sql, [id], (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

module.exports = {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
};