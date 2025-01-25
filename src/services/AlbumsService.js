const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    /*async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        }
        const result = await this._pool.query(query)
        // console.log('Result from getAlbumById', result.rows)

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan`);
        }
        return result.rows[0];
    }*/

    /*async getAlbumByAlbumId(albumId) {
        const query = {
            text: 'SELECT albums.id, albums.name, albums.year, songs.id, songs.title, songs.performer FROM albums LEFT JOIN songs ON albums.id = songs."albumId" WHERE id = $1',
            values: [albumId],
        }
        const result = await this._pool.query(query)
        // console.log('Result from getAlbumById', result.rows)

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${albumId} tidak ditemukan`);
        }
        return result.rows[0];
    }888*/

    async getAlbumById(id) {
        const albumQuery = {
            text: `
                SELECT id, name, year 
                FROM albums 
                WHERE id = $1
            `,
            values: [id],
        };
    
        const songsQuery = {
            text: `
                SELECT id, title, performer 
                FROM songs 
                WHERE "albumId" = $1
            `,
            values: [id],
        };
    
        const albumResult = await this._pool.query(albumQuery);
        const songsResult = await this._pool.query(songsQuery);
    
        if (!albumResult.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan`);
        }
    
        const album = {
            ...albumResult.rows[0],
            songs: songsResult.rows
        };
    
        return album;
    }

    async updateAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui Album.Album tidak ditemukan');
        }

        return result.rows[0].id;
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan`);
        }
    }
}

module.exports = AlbumsService;