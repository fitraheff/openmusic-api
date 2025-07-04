const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;
        const albumId = await this._service.addAlbum({ name, year });
        const response = h.response({
            status: 'success',
            data: {
                albumId
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumsByIdHandler(request) {
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);
        return {
            status: 'success',
            data: {
                album
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;
        await this._service.updateAlbumById(id, request.payload);
        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;
        await this._service.deleteAlbumById(id);
        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }

    async postUploadAlbumCoverHandler(request, h) {
        const { id } = request.params;
        const { cover } = request.payload;

        this._validator.validateImageHeaders(cover.hapi.headers);
        await this._service.getAlbumById(id);
        await this._service.uploadAlbumCover(id, cover);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async postLikeAlbumHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.getAlbumById(albumId);
        await this._service.addLikesAlbum(albumId, credentialId);

        const response = h.response({
            status: 'success',
            message: 'Like berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async deleteLikeAlbumHandler(request) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.getAlbumById(albumId);
        await this._service.deleteLikesAlbum(albumId, credentialId);

        return {
            status: 'success',
            message: 'Like berhasil dihapus',
        };
    }

    async getLikesAlbumHandler(request, h) {
        const { id } = request.params;

        const { likes, isFromCache } = await this._service.getLikesAlbum(id);

        const response = h.response({
            status: 'success',
            data: { likes },
        });

        if (isFromCache) {
            response.header('X-Data-Source', 'cache');
        }
        return response;
    }
}

module.exports = AlbumsHandler;