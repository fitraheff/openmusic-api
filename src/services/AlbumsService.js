const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
    constructor(storageService, cacheService) {
        this._pool = new Pool();

        this._storageService = storageService;
        this._cacheService = cacheService;
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

    async addLikesAlbum(albumId, userId) {
        const id = `likes-${nanoid(16)}`;

        try {
            const query = {
                text: 'INSERT INTO user_album_likes (id, "albumId", "userId") VALUES($1, $2, $3) RETURNING id',
                values: [id, albumId, userId],
            };

            const result = await this._pool.query(query);

            if (!result.rows[0].id) {
                throw new InvariantError('Like gagal ditambahkan');
            }

            await this._cacheService.delete(`likes:${albumId}`);

            return result.rows[0].id;
        } catch (error) {
            if (error.code === '23505') {
                throw new InvariantError('Anda sudah menyukai album ini');
            }
            throw error;
        }
    }

    async deleteLikesAlbum(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE "albumId" = $1 AND "userId" = $2 RETURNING id',
            values: [albumId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
        }

        await this._cacheService.delete(`likes:${albumId}`);
    }

    async getLikesAlbum(id) {
        try {
            const likes = await this._cacheService.get(`likes:${id}`);
            return { likes: JSON.parse(likes), isFromCache: true };
        } catch (error) {
            const query = {
                text: 'SELECT * FROM user_album_likes WHERE "albumId" = $1',
                values: [id],
            };

            const result = await this._pool.query(query);

            await this._cacheService.set(`likes:${id}`, JSON.stringify(result.rowCount));

            return { likes: result.rowCount, isFromCache: false };
        }
    }
}

module.exports = AlbumsService;