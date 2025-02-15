const autoBind = require('auto-bind');

class PlaylistHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { id: credentialId } = request.auth.credentials
        const { name } = request.payload;

        const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

        const response = h.response({
            status: 'success',
            data: {
                playlistId
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistsByIdHandler(request) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        await this._service.deletePlaylistsById(playlistId);
        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    async postSongsPlaylistHandler(request, h) {
        this._validator.validateAddSongPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;
        const { songId } = request.payload;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        await this._service.addSongPlaylist(playlistId, songId);



        const response = h.response({
            status: 'success',
            message: 'Song berhasil ditambahkan ke playlist',
        })

        await this._service.addPlaylistActivity({
            playlistId,
            songId,
            userId: credentialId,
            action: 'add',
        });
        // console.log('Adding activity:', { addPlaylistActivity: { playlistId, songId, userId, action } });

        response.code(201);
        return response;
    }

    async getSongsPlaylistHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._service.getPlaylistById(playlistId);
        const songs = await this._service.getPlaylistSongs(playlistId);

        return {
            status: 'success',
            data: {
                playlist: {
                    id: playlist.id,
                    name: playlist.name,
                    username: playlist.username,
                    songs,
                }
            },
        };
    }

    async deleteSongsPlaylistHandler(request) {
        // this._validator.validateDeleteSongPayload(request.payload);

        const { playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        console.log('Playlist ID:', playlistId);
        console.log('Song ID:', songId);
        console.log('Payload:', request.payload);

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        await this._service.deleteSongPlaylist(playlistId, songId);

        await this._service.addPlaylistActivity({
            playlistId, songId, userId: credentialId, action: 'delete'
        });

        return {
            status: 'success',
            message: 'Song berhasil dihapus dari playlist',
        };
    }

    async getActivitiesPlaylistHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;
        // console.log('Playlist ID params:', playlistId);

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._service.getPlaylistById(playlistId);
        const activities = await this._service.getPlaylistActivities(playlistId);

        // console.log('Playlist ID await:', playlist);
        return {
            status: 'success',
            data: {
                playlistId: playlist.id,
                activities, // Gunakan hasil dari getPlaylistActivities
            },
            
        };
        console.log(data);
    }
}

module.exports = PlaylistHandler;