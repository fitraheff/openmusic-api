const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
    constructor(storageService) {
        this._pool = new Pool();
        this._storageService = storageService;
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

    async getAlbumById(id) {
        const albumQuery = {
            text: `
                SELECT id, name, year, "coverUrl" 
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

    async uploadAlbumCover(id, cover) {
        const filename = await this._storageService.writeFile(cover, cover.hapi);

        const encodedFileName = encodeURIComponent(filename);
        const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/album/cover/${encodedFileName}`;

        const query = {
            text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan`);
        }
    }

}

module.exports = AlbumsService;