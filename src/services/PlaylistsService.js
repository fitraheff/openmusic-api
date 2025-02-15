const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(collaborationsService, songsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
        this._songsService = songsService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
                LEFT JOIN users ON users.id = playlists.owner
                LEFT JOIN collaborations ON collaborations."playlistId" = playlists.id
                WHERE playlists.owner = $1 OR collaborations."userId" = $1
                GROUP BY playlists.id, users.username`,
            values: [owner],
        };
        // console.log('Owner:', owner);

        const result = await this._pool.query(query);
        // console.log(result.rows);
        return result.rows;
    }

    async getPlaylistById(playlisId) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
                LEFT JOIN users ON users.id = playlists.owner
                WHERE playlists.id = $1`,
            values: [playlisId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        return result.rows[0];
    }

    async deletePlaylistsById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    /*
    async deletePlaylistsById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
        return result.rows[0].id;
    }
    */

    async addSongPlaylist(playlistId, songId) {
        const id = `playlist-song-${nanoid(16)}`;

        await this._songsService.getSongById(songId);

        const query = {
            text: 'INSERT INTO playlist_songs (id, "playlistId", "songId") VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };
        // console.log('Playlist ID:', playlistId);
        // console.log('Song ID:', songId);
        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        return result.rows[0].id;
    }

    async getPlaylistSongs(playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            LEFT JOIN playlist_songs ON playlist_songs."songId" = songs.id
            WHERE playlist_songs."playlistId" = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deleteSongPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE "playlistId" = $1 AND "songId" = $2 RETURNING id',
            values: [playlistId, songId],
        };
        console.log('Executing query:', query);

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
    //
    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }
    //
    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addPlaylistActivity({playlistId, songId, userId, action}) {
        const activityId = `activity-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_activities (id, "playlistId", "songId", "userId", action) VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [activityId, playlistId, songId || null, userId, action],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist activity gagal ditambahkan');
        }
    }

    async getPlaylistActivities(playlistId) {
        const query = {
            text: `SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time
            FROM playlist_activities
            LEFT JOIN users ON users.id = playlist_activities."userId"
            LEFT JOIN songs ON playlist_activities."songId" = songs.id
            WHERE playlist_activities."playlistId" = $1
            ORDER BY playlist_activities.time ASC`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist activity tidak ditemukan');
        }

        return result.rows;
    }
};


module.exports = PlaylistsService;
