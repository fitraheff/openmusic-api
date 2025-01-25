const autoBind = require('auto-bind');

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload);
        const { title, year, genre, performer, duration, albumId } = request.payload;
        const song_id = await this._service.addSong({ title, year, genre, performer, duration, albumId: albumId || null });
        const response = h.response({
            status: 'success',
            data: {
                songId: song_id
            },
        });
        response.code(201);
        return response;
    }

    async getSongsHandler(request, h) {
        const { title = '', performer = '' } = request.query;
    
        // Pastikan Anda memanggil getSongs dengan parameter terpisah
        const songs = await this._service.getSongs(title, performer);
    
        return {
            status: 'success',
            data: {
                songs: songs,
            },
        };
    }
    

    async getSongByIdHandler(request, h) {
        const { id } = request.params;
        const song = await this._service.getSongById(id);
        return {
            status: 'success',
            data: {
                song: song
            },
        };
    }

    async putSongByIdHandler(request, h) {
        this._validator.validateSongPayload(request.payload);
        const { id } = request.params;
        await this._service.updateSongById(id, request.payload);
        return {
            status: 'success',
            message: 'Song berhasil diperbarui',
        };
    }

    async deleteSongByIdHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteSongById(id);
        return {
            status: 'success',
            message: 'Song berhasil dihapus',
        };
    }
}

module.exports = SongsHandler;