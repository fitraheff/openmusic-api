const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {

        const id = `song-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, genre, performer, duration || null, albumId || null],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    /*async getSongs(title, performer) {
        const conditions = [];
        const values = [];
    
        // Periksa jika title ada dan merupakan string
        if (title && typeof title === 'string') {
            conditions.push('LOWER(title) LIKE LOWER($' + (values.length + 1) + ')');
            values.push(`%${title}%`);
        }
    
        // Periksa jika performer ada dan merupakan string
        if (performer && typeof performer === 'string') {
            conditions.push('LOWER(performer) LIKE LOWER($' + (values.length + 1) + ')');
            values.push(`%${performer}%`);
        }
    
        let query = 'SELECT id, title, performer FROM songs';
    
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
    
        console.log('Executing query:', query, values); // Debug log
    
        const result = await this._pool.query(query, values);
        return result.rows;
    }*/

    async getSongs(title, performer) {
        let baseQuery = 'SELECT id, title, performer FROM songs';  // Mulai query dasar
        const values = [];
        const conditions = [];
    
        // Jika ada parameter title, tambahkan kondisi pencarian
        if (title) {
            conditions.push(`title ILIKE $${conditions.length + 1}`);
            values.push(`%${title}%`);
        }
    
        // Jika ada parameter performer, tambahkan kondisi pencarian
        if (performer) {
            conditions.push(`performer ILIKE $${conditions.length + 1}`);
            values.push(`%${performer}%`);
        }
    
        // Jika ada kondisi pencarian, tambahkan ke query
        if (conditions.length > 0) {
            baseQuery += ' WHERE ' + conditions.join(' AND ');
        }
    
        // Menyiapkan query untuk dijalankan
        const query = {
            text: baseQuery,
            values,
        };
    
        // Jalankan query ke database dan ambil hasilnya
        const result = await this._pool.query(query);
        
        // Debug: Cek apakah query mengembalikan hasil yang sesuai
        console.log("Query Result:", result.rows);
        
        // Mengembalikan seluruh hasil data lagu, bukan hanya ID
        return result.rows;  // Kembalikan seluruh data lagu yang ditemukan
    }
    
    
    

    async getSongById(id){
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);   

        if (!result.rows.length) {
            throw new NotFoundError(`Lagu dengan id ${id} tidak ditemukan`);
        }

        return result.rows[0];  
    }

    async updateSongById(id, { title, year, genre, performer, duration, albumId }) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError(`Lagu dengan id ${id} tidak ditemukan`);
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(`Lagu dengan id ${id} tidak ditemukan`);
        }
    }
}

module.exports = SongsService;